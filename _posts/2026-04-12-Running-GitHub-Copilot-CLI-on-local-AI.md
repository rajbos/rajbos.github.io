---
layout: post
title: Running GitHub Copilot CLI on local AI inference
date: 2026-04-12
tags: [GitHub, GitHub Copilot, Generative AI, Local AI, Ollama, LM Studio, Foundry Local, HuggingFace, vLLM, TGI, Docker, PowerShell, Windows]
description: "A walkthrough of running the GitHub Copilot CLI against local AI inference engines on a Dell Pro Max 14 with Intel Arc 140T, NVIDIA RTX PRO 500, and Intel AI Boost NPU. Covers Ollama, LM Studio, Foundry Local, vLLM, and TGI — what worked, what didn't, and the fastest setup found."
---

# Running GitHub Copilot CLI on local AI inference

I've been using the GitHub Copilot CLI as my main terminal assistant for a while now. It works great with GitHub-hosted models (Claude, GPT-4) but that means every command, every file you give it context about, every prompt goes over the wire to a cloud provider. And what's worse: it means that the cloud provider is hosting the beefy LLM model for me, incurring a lot of compute cost. So I wanted to explore what it looks like to run the whole thing locally — both for privacy and just to see how far local models have come. I think I have a good setup on a recent laptop, with two GPU's and an NPU, so let's see how far we can go.

The Copilot CLI now supports a "bring your own key" (BYOK) mode where you point it at any OpenAI-compatible API endpoint. That means any local inference engine that exposes a `/v1/chat/completions` endpoint should work in theory. In practice there's quite a bit to figure out.

## Hardware I was testing on

My machine is a Dell Pro Max 14 MC14250 from Q4, 2025. It has an Intel Core Ultra 7 265H processor in it, with 32GB RAM and a 1TB SSD. The interesting thing about this machine is that it has three separate AI-capable processors:

- **Intel Arc 140T** (GPU 0) — 16 GB VRAM, integrated but a full GPU with dedicated AI acceleration
- **NVIDIA RTX PRO 500 Blackwell** (GPU 1) — 6.1 GB dedicated VRAM (GDDR — fast video memory separate from system RAM)
- **Intel AI Boost NPU** — dedicated neural processing unit built into the CPU

On paper that's a lot of local AI horsepower. In practice, as I found out, things are more complicated.

## How the BYOK configuration works

The Copilot CLI reads four environment variables to switch from cloud to local inference. If you have a local ollama instance running, you can point the CLI at it with:

```powershell
$env:COPILOT_PROVIDER_BASE_URL          = "http://localhost:11434/v1"
$env:COPILOT_MODEL                      = "qwen2.5:7b-instruct-32k"
$env:COPILOT_PROVIDER_MAX_PROMPT_TOKENS = "32768"
$env:COPILOT_PROVIDER_MAX_OUTPUT_TOKENS = "8192"
```
Presuming you have downloaded that model into Ollama and it's running on that port of course. The CLI will then send all requests to that local endpoint instead of the cloud.

You don't need `COPILOT_PROVIDER_TYPE` (it defaults to `openai`, which is compatible with all the local engines below) and you don't need an API key for local inference. To switch back to cloud, you just remove those variables.

One critical thing I learned early: the **context window matters a lot**. The Copilot CLI system prompt including all tool definitions is around **21,000 tokens**. That's before you've typed a single character. Any model running with less than 32k context will get its prompt truncated and start behaving strangely — either losing tools mid-conversation or giving incoherent responses.

## What I tried

### Ollama — works, with some gotchas

Ollama is the easiest starting point. Install it, pull a model, and it's running an OpenAI-compatible API on port 11434. The first thing I ran into was the URL: you need the `/v1` suffix (`http://localhost:11434/v1`), not just `http://localhost:11434`. The docs example omits it and you get a 404.

The second thing I ran into was the context window. By default most Ollama models run with a 2048 or 4096 context window. With a 21k system prompt you need at least 32k. I had to create a custom `Modelfile`:

```
FROM qwen2.5:7b-instruct
PARAMETER num_ctx 32768
```

Then create it with: `ollama create qwen2.5:7b-instruct-32k -f Modelfile`

A couple of performance settings also helped, particularly for flash attention and KV cache quantization. The KV cache (key-value cache) stores the intermediate attention values the model computes for each token — with a 32k context window it can consume 1–2 GB of VRAM, so compressing it matters:

```powershell
[System.Environment]::SetEnvironmentVariable("OLLAMA_FLASH_ATTENTION", "1", "User")
[System.Environment]::SetEnvironmentVariable("OLLAMA_KV_CACHE_TYPE", "q8_0", "User")
```

Restart Ollama after setting these. The NVIDIA RTX PRO 500 can handle the 32k KV cache with these settings.

**On model selection:** not all models support tool calling, which the Copilot CLI relies on heavily. From what I tested, `gemma3`, `mistral:7b`, and `qwen2.5-coder:1.5b-base` all fail because they don't support tool calls. `qwen2.5:7b-instruct` works well. Llama 3.1 8B also works but quality is mediocre.

**Ollama verdict:** ✅ Works. `qwen2.5:7b-instruct-32k` on the NVIDIA GPU is the sweet spot. Slow (~30% GPU utilisation, around 13 tokens/sec) but functional.

---

### Foundry Local — almost entirely blocked because of driver limitations

Microsoft Foundry Local is interesting because it uses OpenVINO and can target all three AI processors: the Arc GPU, the NPU, and CUDA. I installed it with `winget install Microsoft.FoundryLocal`.

One nice thing about Foundry Local is that it automatically picks the best model variant for your hardware. You just say `foundry model run qwen2.5-7b` and it figures out whether to download the CUDA, OpenVINO GPU, or NPU variant.

That sounds great, but I hit walls on every path:

**NPU (Intel AI Boost):** All the NPU-optimised models cap at `maxInputTokens=3696`. The CLI needs ~21k. That's a hard fail — not a configuration issue, it's a hardware architectural limit of how much context the NPU can process in one inference pass. Nothing to be done here until Intel expands the NPU context window in future driver versions.

**OpenVINO GPU (Arc 140T):** This is the interesting path — the Arc 140T has 16GB and could run 7B models comfortably. But every OpenVINO GPU model I tried threw `EPContext node not found`. The root cause seems to be a driver version mismatch: the Arc driver I have installed (32.0.101.8509, the Dell OEM version from November 2025) is older than what Foundry Local's OpenVINO runtime needs (32.0.101.8629, released April 2026). Dell hasn't published the new driver for the MC14250 yet. Once that driver lands, this path should work well — 7B models on 16GB with no memory pressure. I've had some driver issues in the past, so moving over to the raw driver from Intel's site is a bit scary for now, but it's on the table if Dell doesn't update soon.

**CUDA (NVIDIA):** 7B models crash with Out of Memory (OOM). 6GB VRAM isn't enough for the model weights plus the KV cache for 28k context. A 1.5B model works but it's not capable enough for agentic tasks.

**Foundry Local verdict:** ❌ Blocked by driver version. Worth revisiting once Dell publishes the Arc driver update.

---

### LM Studio — works with the right configuration

LM Studio uses llama.cpp under the hood and exposes an OpenAI-compatible server. It supports Vulkan, which means it can run on Intel Arc without needing OpenVINO or driver-specific binaries.

Install it with:
```powershell
winget install ElementLabs.LMStudio --scope user
```

Then there are several things to get right:

**Context window:** Defaults to 4096. The model load fails with `n_keep >= n_ctx` until you change it. In the Developer tab, set the context length to **32768** before loading the model.

**URL:** Use `http://127.0.0.1:1234/v1`, not `http://localhost:1234/v1`. LM Studio binds IPv4 only and on some Windows machines `localhost` resolves to `::1` (IPv6), causing a connection refused.

**GPU selection:** This was the most complex part. LM Studio's default is the CUDA backend when a CUDA-capable GPU is present — meaning it runs on the NVIDIA card, not Arc. Getting it onto Arc requires switching the backend to Vulkan, which means editing `%USERPROFILE%\.lmstudio\.internal\backend-preferences-v1.json`:

```json
[{"model_format":"gguf","name":"llama.cpp-win-x86_64-vulkan-avx2","version":"2.13.0"}]
```

But even with Vulkan enabled, LM Studio still defaulted to the NVIDIA card — because under Vulkan, the NVIDIA card (Vulkan device 1) is classified as "Discrete" and gets priority over the Arc (Vulkan device 0, classified as "Integrated"). The fix is to go to **Settings → Hardware** in LM Studio and disable the RTX PRO 500. LM Studio then writes this to `hardware-config.json`:

```json
{"json":[["llama.cpp-win-x86_64-vulkan-avx2",{"fields":[{"key":"load.gpuSplitConfig","value":{"strategy":"evenly","disabledGpus":[1],"priority":[],"customRatio":[]}}]}]],"meta":{"values":["map"]}}
```

**Arc 140T alone is too slow.** This surprised me. The Arc has 16GB but it's *integrated* memory — shared system memory (LPDDR5x) at ~68 GB/s bandwidth. Running a 7B model on it saturated the memory bus and froze my entire machine, including the mouse. LLM inference is completely memory-bandwidth-bound, and 68 GB/s shared with the CPU simply isn't enough for interactive use.

The working configuration ended up being to offload **25 layers of the model to NVIDIA GDDR, the rest on CPU**. LM Studio auto-selects this split when both GPUs are enabled. The NVIDIA's dedicated GDDR bandwidth handles the hot layers and the CPU handles the rest. Inference takes longer than pure NVIDIA CUDA, but it works without freezing the machine.

**Model selection for LM Studio:** My first download was `qwen2.5.1-coder-7b-instruct`, which technically works but is mediocre at agentic tasks — it doesn't proactively explore the repository you're working in and needs very explicit prompting. The coder fine-tune trades general instruction following for code completion, which hurts agentic behaviour.

Switching to `qwen2.5-7b-instruct@q5_k_m` (the bartowski build from Discover) gave better results. The `@q5_k_m` suffix is the quantization level — 5-bit compressed weights, a smaller and faster-to-run version of the model with only a marginal quality trade-off versus the full-precision original. Still not at the quality level of online Claude, but the tool calling works correctly and it handles the CLI's complex nested JSON schemas for things like asking the user clarifying questions.

I also tried **Gemma 4 E4B**, which is Google's newest model with 128K context and native tool calling support. The context window is great (it easily fits the CLI prompt with room to spare) but it consistently generated malformed JSON schemas when calling the `ask_user` tool — making up property names that don't exist in the schema. Small models struggle with deeply nested JSON Schema definitions and Gemma 4 E4B isn't an exception.

**The `lms load` re-load trap.** If you call `lms load` while a model is already running, LM Studio doesn't replace it — it creates a second instance with a `:2` suffix (e.g. `qwen2.5-7b-instruct@q4_k_s:2`). The original stays loaded with its old context window. Since the Copilot CLI env var points to the plain identifier, it hits the old instance. Always unload first to free up GPU memory and avoid confusion:

```powershell
lms unload --all
lms load qwen2.5-7b-instruct@q4_k_s --gpu 0.78 --context-length 32768
```

**The `--gpu` trap with the CLI.** After all the above I noticed that loading via `lms load qwen2.5-7b-instruct@q4_k_s --gpu max` sometimes silently fell back to CPU. The only sign is GPU memory: 1852 MiB = CPU mode; 4914 MiB = GPU split. The `--gpu` flag takes a **0–1 fraction of layers**, not a layer count or "max". Using `--gpu 0.78` reliably puts ~25/32 layers on the NVIDIA GDDR which is the max layer config that fits on my GPU. Full load command:

```powershell
lms load qwen2.5-7b-instruct@q4_k_s --gpu 0.78 --context-length 32768
```

Also worth noting: `@q4_k_s` (4-bit quantization, 4.46 GB) is slightly faster than `@q5_k_m` (5-bit quantization, 4.78 GB) because the smaller file leaves more GPU headroom for the KV cache. In practice the quality difference between Q4_K_S and Q5_K_M is imperceptible for agentic tasks.

**LM Studio verdict:** ✅ Works with `qwen2.5-7b-instruct@q4_k_s --gpu 0.78`, 25 layers on NVIDIA, rest on CPU. Fastest 7B config measured on this machine. NPU is not accessible from LM Studio at all.

---

## What the NPU situation actually is

A quick note on the Intel AI Boost NPU since it kept coming up during my research. The NPU is only accessible through OpenVINO — which means Foundry Local is currently the only local inference engine that can use it from the options I tried. But as covered above, all the NPU-optimised models cap at 3,696 input tokens, which is nowhere near enough for the 21k Copilot CLI system prompt. This isn't a software configuration problem — it's the current limit of how the AI Boost NPU processes context in a single pass.

So the NPU is off the table for this use case until Intel ships larger-context NPU models.

---

## What I tried next: vLLM and TGI (HuggingFace inference stack)

After getting Ollama and LM Studio working, I wanted to see if the HuggingFace inference stack could do better. The native PyTorch kernels (AWQ-Marlin, FlashAttention v2) are purpose-built for this hardware and in theory should outperform llama.cpp's GGUF decode. I tried two options: **vLLM** and **TGI (Text Generation Inference)**.

### The format split: GGUF vs safetensors

Before going further, it's worth understanding why these are separate ecosystems:

- **Ollama / LM Studio** → llama.cpp → GGUF only
- **vLLM / TGI** → PyTorch → HuggingFace safetensors only

GGUF is the model file format used by llama.cpp — think of it as the packaging format for quantized models in the Ollama/LM Studio ecosystem. Safetensors is HuggingFace's format, used by PyTorch-based runtimes like vLLM and TGI. Both support "4-bit" quantization but they're completely different kernel implementations. You can't load a GGUF file into vLLM or a safetensors file into Ollama.

For Qwen2.5-7B on a 6 GB GPU, the right HuggingFace model is `Qwen/Qwen2.5-7B-Instruct-AWQ` — an AWQ (Activation-aware Weight Quantization) 4-bit model, about 4.5 GB on disk.

### vLLM via Docker

vLLM is the most production-grade HuggingFace inference server. The official Docker image (`vllm/vllm-openai:latest`) comes with CUDA, FlashAttention, and AWQ-Marlin kernels pre-built.

Getting it to fit on a 6 GB GPU required a few tricks:

```powershell
docker run -d --runtime nvidia --gpus all --name vllm-server `
    -v hf-cache:/root/.cache/huggingface `
    -p 127.0.0.1:8000:8000 --shm-size 2g `
    vllm/vllm-openai:latest `
    --model Qwen/Qwen2.5-7B-Instruct-AWQ --quantization awq_marlin `
    --max-model-len 32768 --gpu-memory-utilization 0.81 `
    --kv-cache-dtype fp8 --max-num-seqs 1 `
    --cpu-offload-gb 2 --enforce-eager `
    --dtype auto --host 0.0.0.0 --port 8000
```

Key constraints on a 6 GB card:
- **Free VRAM after CUDA runtime init is only 4.89 GiB** out of 5.97 GiB total — `--gpu-memory-utilization 0.81` is the cap
- **AWQ weights alone need 5.2 GiB on-GPU** → `--cpu-offload-gb 2` drops that to 3.17 GiB, freeing 1.25 GiB for KV cache
- **`--kv-cache-dtype fp8`** halves KV footprint vs fp16 (fp8/fp16 = 8-bit vs 16-bit floating-point precision for stored values; lower precision = smaller memory footprint), required for 32k context
- **`-v hf-cache:/root/.cache/...`** — use a named Docker volume, not a Windows bind mount. Loading from NTFS through VirtioFS takes 20+ minutes per model shard

Use `127.0.0.1:8000:8000` not `8000:8000` — the unqualified form sometimes fails silently when old wslrelay processes still hold the port.

The logs confirm FlashAttention v2 and AWQ-Marlin kernels loaded, which is great. But the benchmark result was sobering: **~2.6 tok/s**. The CPU offload is the bottleneck — those 2 GiB of weight layers go through PCIe every single token. The architecture simply isn't designed for this.

**vLLM verdict:** ⚠️ Works but impractical on 6 GB. 2.6 tok/s is too slow for interactive CLI use. Natural fit is GPUs with ≥10 GB where the model fits fully in VRAM.

### TGI (Text Generation Inference)

TGI is HuggingFace's own inference server. It has native AWQ support and the official image is well-maintained. But there's a hard blocker on 6 GB:

- AWQ weights = 5.2 GiB. GPU total = 5.97 GiB. After CUDA init there's ~4.89 GiB free.
- **TGI has no `--cpu-offload-gb` equivalent.** It must load the entire model into VRAM.
- Result: OOM at KV cache allocation. The weights alone don't fit, let alone any context.

There's also a WSL2 Triton linker bug that needs `-e LIBRARY_PATH=/usr/local/cuda-12.4/compat` to find `libcuda.so`, but even with that fix the OOM is structurally unavoidable.

**TGI verdict:** ❌ OOM on 6 GB with this model and context size. TGI has no CPU offload path, so the full model must fit in VRAM. On larger GPUs (≥8 GB free after init) this wouldn't be an issue.

---

## The PowerShell profile setup

After going through all of this I set up a clean way to switch between providers from any terminal session. The `set-copilot-local` function gives you an interactive arrow-key menu to pick provider and model. `online-copilot` clears everything back to defaults.

```powershell
function Invoke-InteractiveMenu {
    param(
        [string]$Title,
        [string[]]$Options
    )
    $selected = 0
    $count = $Options.Count
    [Console]::CursorVisible = $false
    try {
        Write-Host $Title -ForegroundColor Cyan
        for ($i = 0; $i -lt $count; $i++) {
            if ($i -eq $selected) { Write-Host "  > $($Options[$i])" -ForegroundColor Yellow }
            else { Write-Host "    $($Options[$i])" -ForegroundColor Gray }
        }
        while ($true) {
            $key = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
            $prev = $selected
            switch ($key.VirtualKeyCode) {
                38 { if ($selected -gt 0) { $selected-- } }              # Up
                40 { if ($selected -lt $count - 1) { $selected++ } }     # Down
                13 { Write-Host ""; return $selected }                   # Enter
            }
            if ($prev -ne $selected) {
                $pos = $Host.UI.RawUI.CursorPosition
                $pos.Y -= $count
                $Host.UI.RawUI.CursorPosition = $pos
                for ($i = 0; $i -lt $count; $i++) {
                    $line  = if ($i -eq $selected) { "  > $($Options[$i])" }
                             else { "    $($Options[$i])" }
                    $color = if ($i -eq $selected) { "Yellow" } else { "Gray" }
                    Write-Host $line.PadRight($Host.UI.RawUI.WindowSize.Width - 1) -ForegroundColor $color
                }
            }
        }
    } finally {
        [Console]::CursorVisible = $true
    }
}

# Launch LM Studio (Vulkan backend pre-configured via hardware-config.json)
function Start-LMStudio {
    Start-Process "$env:LOCALAPPDATA\Programs\LM Studio\LM Studio.exe"
    Write-Host "LM Studio launched (Vulkan/Arc backend configured)" -ForegroundColor Green
}

# Write the hardware-config.json that disables the NVIDIA GPU (Vulkan device 1)
# so llama.cpp Vulkan uses Arc 140T (device 0). Re-run after LM Studio reinstalls.
function Set-LMStudioArcGPU {
    $hwConfig = "$env:USERPROFILE\.lmstudio\.internal\hardware-config.json"
    $json = '{"json":[["llama.cpp-win-x86_64-vulkan-avx2",{"fields":[{"key":"load.gpuSplitConfig","value":{"strategy":"evenly","disabledGpus":[1],"priority":[],"customRatio":[]}}]}]],"meta":{"values":["map"]}}'
    Set-Content $hwConfig $json -Encoding utf8
    Write-Host "LM Studio: NVIDIA disabled, Arc 140T active" -ForegroundColor Green
}

function set-copilot-local {
    $providerIdx = Invoke-InteractiveMenu -Title "Select inference provider:" -Options @(
        "Ollama        (localhost:11434)"
        "Foundry Local (localhost:63839)"
        "LM Studio     (localhost:1234)"
        "vLLM / HuggingFace (127.0.0.1:8000)"
    )

    if ($providerIdx -eq 0) {
        # Ollama — qwen2.5:7b-instruct-32k is a custom Modelfile with num_ctx 32768
        $baseUrl = "http://localhost:11434/v1"
        $models  = @(
            [PSCustomObject]@{ Name = "qwen2.5:7b-instruct-32k"; PromptTokens = 32768;  OutputTokens = 8192 }
            [PSCustomObject]@{ Name = "llama3.1:8b";             PromptTokens = 131072; OutputTokens = 8192 }
            [PSCustomObject]@{ Name = "llama3.2:3b";             PromptTokens = 131072; OutputTokens = 8192 }
        )
    } elseif ($providerIdx -eq 1) {
        # Foundry Local — port is dynamic, detected from service status
        # WARNING: OpenVINO GPU models need Arc driver 32.0.101.8629 (not yet on Dell MC14250)
        $statusOutput = foundry service status 2>&1
        $foundryUrl = ($statusOutput | Select-String -Pattern 'http://[\d.:]+' | ForEach-Object { $_.Matches[0].Value } | Select-Object -First 1)?.TrimEnd('/')
        if (-not $foundryUrl) {
            Write-Host "Foundry Local service is not running. Starting it..." -ForegroundColor Yellow
            $startOutput = foundry service start 2>&1 | Select-String -Pattern 'http://[\d.:]+'
            $foundryUrl = $startOutput?.Matches[0].Value?.TrimEnd('/')
        }
        if (-not $foundryUrl) { $foundryUrl = "http://127.0.0.1:63839" }
        $baseUrl = "$foundryUrl/v1"
        $models  = @(
            [PSCustomObject]@{ Name = "qwen2.5-1.5b-instruct-cuda-gpu:4"; PromptTokens = 28672; OutputTokens = 4096 }
        )
    } elseif ($providerIdx -eq 2) {
        # LM Studio — use 127.0.0.1 not localhost (LM Studio binds IPv4 only)
        # Always unload before load: lms load adds a :2 duplicate if any model is already running.
        # --gpu 0.78 = ~25/32 layers on NVIDIA GDDR (0-1 fraction, NOT layer count).
        $baseUrl = "http://127.0.0.1:1234/v1"
        $models  = @(
            [PSCustomObject]@{ Name = "qwen2.5-7b-instruct@q4_k_s"; PromptTokens = 32768; OutputTokens = 8192 } # 17.2 tok/s — fastest 7B
            [PSCustomObject]@{ Name = "qwen2.5-7b-instruct@q5_k_m"; PromptTokens = 32768; OutputTokens = 8192 } # 13.6 tok/s
            [PSCustomObject]@{ Name = "gemma-4-e4b";                  PromptTokens = 65536; OutputTokens = 8192 }
            [PSCustomObject]@{ Name = "qwen2.5-14b-instruct";         PromptTokens = 32768; OutputTokens = 8192 }
        )
        $lmsExe = "$env:LOCALAPPDATA\Programs\LM Studio\resources\app\.webpack\lms.exe"
        if (Test-Path $lmsExe) {
            Write-Host "  ⏹  Unloading existing models..." -ForegroundColor DarkGray
            & $lmsExe unload --all 2>$null
        }
    } else {
        # vLLM (HuggingFace) — OpenAI-compatible on port 8000
        # Requires a running vLLM container. ~2.6 tok/s on 6 GB (cpu-offload-gb 2). Best on GPUs ≥10 GB.
        # Start the container first (startup takes ~5 min); check logs for "Application startup complete".
        $baseUrl = "http://127.0.0.1:8000/v1"
        $models  = @(
            [PSCustomObject]@{ Name = "Qwen/Qwen2.5-7B-Instruct-AWQ"; PromptTokens = 32768; OutputTokens = 8192 }
        )
        try { $null = Invoke-WebRequest "http://127.0.0.1:8000/v1/models" -TimeoutSec 2 -ErrorAction Stop }
        catch { Write-Warning "vLLM not responding. Start the container first." }
    }

    $modelIdx = Invoke-InteractiveMenu -Title "Select model:" -Options ($models | ForEach-Object { $_.Name })
    $selected = $models[$modelIdx]

    # For LM Studio: load the selected model with correct GPU split and context length
    if ($providerIdx -eq 2) {
        $lmsExe = "$env:LOCALAPPDATA\Programs\LM Studio\resources\app\.webpack\lms.exe"
        if (Test-Path $lmsExe) {
            $ctxLen = if ($selected.PromptTokens -ge 65536) { "65536" } else { "32768" }
            Write-Host "  ▶  Loading $($selected.Name) --gpu 0.78 --context-length $ctxLen ..." -ForegroundColor DarkYellow
            & $lmsExe load $selected.Name --gpu 0.78 --context-length $ctxLen
        }
    }

    $env:COPILOT_PROVIDER_BASE_URL         = $baseUrl
    $env:COPILOT_MODEL                      = $selected.Name
    $env:COPILOT_PROVIDER_MAX_PROMPT_TOKENS = $selected.PromptTokens
    $env:COPILOT_PROVIDER_MAX_OUTPUT_TOKENS = $selected.OutputTokens

    $providerName = @("Ollama", "Foundry Local", "LM Studio", "vLLM")[$providerIdx]
    Write-Host "Copilot provider set to local inference via [$providerName] with model [$($selected.Name)]" -ForegroundColor Green
}

function online-copilot {
    Remove-Item Env:COPILOT_PROVIDER_BASE_URL          -ErrorAction SilentlyContinue
    Remove-Item Env:COPILOT_MODEL                       -ErrorAction SilentlyContinue
    Remove-Item Env:COPILOT_PROVIDER_MAX_PROMPT_TOKENS  -ErrorAction SilentlyContinue
    Remove-Item Env:COPILOT_PROVIDER_MAX_OUTPUT_TOKENS  -ErrorAction SilentlyContinue
    Write-Host "Copilot provider set to online inference (default)" -ForegroundColor Green
}
```

The main functions that I use here is `set-copilot-local` for when I want to switch to local inference, and `online-copilot` to switch back to the default online models in the same terminal session. By default this means Copilot still runs against the cloud models, so I don't accidentally lose functionality in a random terminal window. But when I want to test local models, it's just a quick `set-copilot-local` and a couple of arrow keys to pick the provider and model.

---

## Summary of what works today (April 2026)

| Option | Status | Notes |
|---|---|---|
| `online-copilot` (GitHub-hosted Claude/GPT) | ✅ Best | Default, no setup needed |
| LM Studio `qwen2.5-7b-instruct@q4_k_s`, `--gpu 0.78` | ✅ Works | **17.2 tok/s** — fastest 7B measured |
| LM Studio `qwen2.5-7b-instruct@q5_k_m`, 25 layers NVIDIA + CPU | ✅ Works | 13.6 tok/s |
| Ollama `qwen2.5:7b-instruct-32k` on NVIDIA | ✅ Works | 11.25 tok/s |
| vLLM `Qwen2.5-7B-Instruct-AWQ` with `--cpu-offload-gb 2` | ⚠️ Too slow | 2.6 tok/s — CPU offload bottleneck on 6 GB |
| TGI `Qwen2.5-7B-Instruct-AWQ` | ❌ OOM | No CPU offload support; 5.2 GiB weights won't fit |
| Foundry Local on Arc 140T (OpenVINO GPU) | ❌ Blocked | Needs Arc driver 32.0.101.8629 from Dell |
| Foundry Local on NPU | ❌ Too small | 3,696 token limit, CLI needs ~21k |
| Foundry Local CUDA 7B on NVIDIA | ❌ OOM crash | 6 GB isn't enough |
| LM Studio on Arc 140T only (Vulkan) | ❌ Too slow | Saturates shared memory bus, freezes machine |

## Throughput comparison

Speed matters for interactive use. The Copilot CLI generates structured JSON for tool calls, thinks through multi-step plans, and writes code — all of which require hundreds of tokens of output per turn. Anything below ~8 tok/s starts to feel noticeably slow for a CLI tool.

I measured output throughput (tokens per second) using a standardised benchmark: each provider was asked to generate a ~250-token PowerShell function, at `temperature=0.2` with `max_tokens=400`, repeated 5 times after a warm-up run. The warm-up run loads the model into VRAM and warms the KV cache; only the subsequent timed runs are averaged.

The test prompt is a fixed PowerShell coding task so every provider generates a roughly comparable amount of output. This measures **output throughput** (decode speed) — which is what you feel as the response streaming in — not prompt processing speed or time-to-first-token.

> ⚠️ **Not a perfect apples-to-apples comparison for all rows.** Ollama, LM Studio, and vLLM run `qwen2.5-7b-instruct` in various quant/format variants (GGUF vs AWQ). Foundry Local runs `qwen2.5-1.5b-instruct` — the only model that fits on the hardware today. The LM Studio and Ollama 7B rows are directly comparable; vLLM is the same model family but different runtime architecture.

The script is available as a Gist: [`Measure-LocalAIThroughput.ps1`](https://gist.github.com/rajbos/8c9a5bfb832469db52482082f88aae06).

| Provider | Model | Avg tok/s (tokens/sec) | Notes |
|---|---|---:|---|
| Foundry Local | `qwen2.5-1.5b-instruct-cuda-gpu:4` | **117** | NVIDIA RTX PRO 500 CUDA — **1.5B model** (not comparable to 7B rows) |
| LM Studio | `qwen2.5-7b-instruct@q4_k_s` | **17.2** | `--gpu 0.78` (25/32 layers NVIDIA GDDR), 32k context — **fastest 7B** |
| LM Studio | `qwen2.5-7b-instruct@q5_k_m` | **13.6** | 25 layers NVIDIA GDDR + CPU, 32k context |
| Ollama | `qwen2.5:7b-instruct-32k` | **11.25** | NVIDIA RTX PRO 500 CUDA, 32k context |
| vLLM (Docker) | `Qwen2.5-7B-Instruct-AWQ` | **2.6** | AWQ-Marlin + FlashAttention v2; `--cpu-offload-gb 2` bottleneck on 6 GB |

A few things to note from these numbers:

- **Foundry Local at 117 tok/s** looks spectacular but it's running a 1.5B model — not capable enough for agentic tasks. Still, it's a preview of what the numbers could look like once the Arc 140T OpenVINO path is unblocked: running a proper 7B model on 16 GB VRAM with no memory pressure.
- **LM Studio Q4_K_S at 17.2 tok/s** is the clear winner for 7B on this machine. The `--gpu 0.78` flag is the key — without it, `--gpu max` silently falls back to CPU when the model + 32k KV cache don't fit, dropping to ~2 tok/s. Q4_K_S being slightly smaller than Q5_K_M gives a bit more KV cache headroom, which is why it beats the 5-bit variant.
- **LM Studio Q5_K_M at 13.6 tok/s** and **Ollama at 11.25 tok/s** are the two most stable options. Ollama's `OLLAMA_FLASH_ATTENTION=1` and `OLLAMA_KV_CACHE_TYPE=q8_0` settings are important — without them the KV cache alone takes 1.75 GB of VRAM, reducing model layers on GPU and dropping throughput to ~9 tok/s.
- **vLLM at 2.6 tok/s** uses AWQ-Marlin kernels and FlashAttention v2 — theoretically the fastest inference stack available. But on 6 GB you need `--cpu-offload-gb 2`, which means 2 GiB of weight layers cross the PCIe bus every single token. The framework overhead cancels out the kernel advantage entirely.
- **You cannot run Ollama and LM Studio at the same time** on this machine. Both want to load the 7B model weights into NVIDIA's 6 GB VRAM. The benchmark script handles this automatically.
- For context: online Claude 3.5 Sonnet generates at 80–100+ tok/s. Local 7B models at 11–17 tok/s are usable but noticeably slower for multi-step agentic work.

---

## Fastest local setup for this machine

Based on all the testing, the fastest practical setup for running GitHub Copilot CLI locally on this Dell Pro Max 14 is:

**LM Studio with `qwen2.5-7b-instruct@q4_k_s`, `--gpu 0.78`** → **17.2 tok/s**

The key steps:

1. Install LM Studio: `winget install ElementLabs.LMStudio --scope user`
2. Download the model via `lms`: `lms get bartowski/Qwen2.5-7B-Instruct-GGUF:Q4_K_S`
3. Load with the correct GPU split: `lms load qwen2.5-7b-instruct@q4_k_s --gpu 0.78 --context-length 32768`
4. Set environment variables and switch Copilot CLI: `set-copilot-local` → LM Studio → q4_k_s

The `--gpu 0.78` flag is the critical one. `--gpu max` looks like it should work but silently falls back to CPU when the model weights plus the 32k KV cache don't fit together in 6 GB. The only way to spot the fallback is to watch GPU memory: ~1.8 GB means CPU mode, ~4.9 GB means proper GPU split. Setting `0.78` explicitly (= fraction of layers to GPU, not layer count) reproducibly gets 25/32 layers onto the NVIDIA GDDR.

> **Real-world caveat:** These numbers are from a synthetic benchmark (3 runs × 200 tokens, fixed prompt). Real Copilot CLI sessions involve longer prompts, tool calls with JSON parsing, and multi-turn context accumulation — all of which affect throughput differently. I'll update this section after extended real-world use.

---

## What I'm waiting for

The most promising path — Foundry Local with OpenVINO on the Arc 140T — is blocked by a single driver update. The Arc 140T has 16 GB of dedicated VRAM with Intel's optimised INT4 kernels via OpenVINO, and the 7B models should run fast and stable with no memory pressure. Once Dell publishes Arc driver 32.0.101.8629 for the MC14250, that's the first thing I'm testing.

Until then, LM Studio with `qwen2.5-7b-instruct@q4_k_s --gpu 0.78` is the fastest local option. And for anything where quality actually matters, `online-copilot` is still the right call.
