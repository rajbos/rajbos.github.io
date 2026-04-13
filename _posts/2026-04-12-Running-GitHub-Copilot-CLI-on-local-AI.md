---
layout: post
title: Running GitHub Copilot CLI on local AI inference
date: 2026-04-12
tags: [GitHub, GitHub Copilot, Generative AI, Local AI, Ollama, LM Studio, Foundry Local, PowerShell, Windows]
description: "A walkthrough of running the GitHub Copilot CLI against local AI inference engines on a Dell Pro Max 14 with Intel Arc 140T, NVIDIA RTX PRO 500, and Intel AI Boost NPU. What worked, what didn't, and the PowerShell profile setup to switch between providers easily."
---

# Running GitHub Copilot CLI on local AI inference

I've been using the GitHub Copilot CLI as my main terminal assistant for a while now. It works great with GitHub-hosted models (Claude, GPT-4) but that means every command, every file you give it context about, every prompt goes over the wire to a cloud provider. And whats worse: it means that cloud provider is hosting the beefy LLM model for me, incurring a lot of compute cost. So I wanted to explore what it looks like to run the whole thing locally — both for privacy and just to see how far local models have come. I think I have a good setup on a recent laptop, with two GPU's and an NPU, so let's how far we can go.

The Copilot CLI now supports a "bring your own key" (BYOK) mode where you point it at any OpenAI-compatible API endpoint. That means any local inference engine that exposes a `/v1/chat/completions` endpoint should work in theory. In practice there's quite a bit to figure out.

## Hardware I was testing on

My machine is a Dell Pro Max 14 MC14250 with an Intel Core Ultra 7 265H. The interesting thing about this machine is that it has three separate AI-capable processors:

- **Intel Arc 140T** (GPU 0) — 16 GB VRAM, integrated but a full GPU with XMX matrix units
- **NVIDIA RTX PRO 500 Blackwell** (GPU 1) — 6.1 GB dedicated GDDR VRAM
- **Intel AI Boost NPU** — dedicated neural processing unit built into the CPU

On paper that's a lot of local AI horsepower. In practice, as I found out, things are more complicated.

## How the BYOK configuration works

The Copilot CLI reads four environment variables to switch from cloud to local inference:

```powershell
$env:COPILOT_PROVIDER_BASE_URL          = "http://localhost:11434/v1"
$env:COPILOT_MODEL                      = "qwen2.5:7b-instruct-32k"
$env:COPILOT_PROVIDER_MAX_PROMPT_TOKENS = "32768"
$env:COPILOT_PROVIDER_MAX_OUTPUT_TOKENS = "8192"
```

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

A couple of performance settings also helped, particularly for flash attention and KV cache quantization:

```powershell
[System.Environment]::SetEnvironmentVariable("OLLAMA_FLASH_ATTENTION", "1", "User")
[System.Environment]::SetEnvironmentVariable("OLLAMA_KV_CACHE_TYPE", "q8_0", "User")
```

Restart Ollama after setting these. The NVIDIA RTX PRO 500 can handle the 32k KV cache with these settings.

**On model selection:** not all models support tool calling, which the Copilot CLI relies on heavily. From what I tested, `gemma3`, `mistral:7b`, and `qwen2.5-coder:1.5b-base` all fail because they don't support tool calls. `qwen2.5:7b-instruct` works well. Llama 3.1 8B also works but quality is mediocre.

**Ollama verdict:** ✅ Works. `qwen2.5:7b-instruct-32k` on the NVIDIA GPU is the sweet spot. Slow (~30% GPU utilisation, around 13 tokens/sec) but functional.

---

### Foundry Local — almost entirely blocked

Microsoft Foundry Local is interesting because it uses OpenVINO and can target all three AI processors: the Arc GPU, the NPU, and CUDA. I installed it with `winget install Microsoft.FoundryLocal`.

One nice thing about Foundry Local is that it automatically picks the best model variant for your hardware. You just say `foundry model run qwen2.5-7b` and it figures out whether to download the CUDA, OpenVINO GPU, or NPU variant.

That sounds great, but I hit walls on every path:

**NPU (Intel AI Boost):** All the NPU-optimised models cap at `maxInputTokens=3696`. The CLI needs ~21k. That's a hard fail — not a configuration issue, it's a hardware architectural limit of how much context the NPU can process in one inference pass. Nothing to be done here until Intel expands the NPU context window in future driver versions.

**OpenVINO GPU (Arc 140T):** This is the interesting path — the Arc 140T has 16GB and could run 7B models comfortably. But every OpenVINO GPU model I tried threw `EPContext node not found`. The root cause is a driver version mismatch: the Arc driver I have installed (32.0.101.8509, the Dell OEM version from November 2025) is older than what Foundry Local's OpenVINO runtime needs (32.0.101.8629, released April 2026). Dell hasn't published the new driver for the MC14250 yet. Once that driver lands, this path should work well — 7B models on 16GB with no memory pressure. I've had some driver issues in the past, so moveing over to the raw driver from Intel's site is a bit scary for now, but it's on the table if Dell doesn't update soon.

**CUDA (NVIDIA):** 7B models OOM crash. 6GB VRAM isn't enough for the model weights plus the KV cache for 28k context. A 1.5B model works but it's not capable enough for agentic tasks.

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

**Arc 140T alone is too slow.** This surprised me. The Arc has 16GB but it's *integrated* memory — shared LPDDR5x at ~68 GB/s bandwidth. Running a 7B model on it saturated the memory bus and froze my entire machine, including the mouse. LLM inference is completely memory-bandwidth-bound, and 68 GB/s shared with the CPU simply isn't enough for interactive use.

The working configuration ended up being to offload **25 layers of the model to NVIDIA GDDR, the rest on CPU**. LM Studio auto-selects this split when both GPUs are enabled. The NVIDIA's dedicated GDDR bandwidth handles the hot layers and the CPU handles the rest. Inference takes longer than pure NVIDIA CUDA, but it works without freezing the machine.

**Model selection for LM Studio:** My first download was `qwen2.5.1-coder-7b-instruct`, which technically works but is mediocre at agentic tasks — it doesn't proactively explore the repository you're working in and needs very explicit prompting. The coder fine-tune trades general instruction following for code completion, which hurts agentic behaviour.

Switching to `qwen2.5-7b-instruct@q5_k_m` (the bartowski build from Discover) gave better results. Still not at the quality level of online Claude, but the tool calling works correctly and it handles the CLI's complex nested JSON schemas for things like asking the user clarifying questions.

I also tried **Gemma 4 E4B**, which is Google's newest model with 128K context and native tool calling support. The context window is great (it easily fits the CLI prompt with room to spare) but it consistently generated malformed JSON schemas when calling the `ask_user` tool — making up property names that don't exist in the schema. Small models struggle with deeply nested JSON Schema definitions and Gemma 4 E4B isn't an exception.

**LM Studio verdict:** ✅ Works with `qwen2.5-7b-instruct@q5_k_m`, 25 layers on NVIDIA, rest on CPU. Quality is noticeably below online models. NPU is not accessible from LM Studio at all.

---

## What the NPU situation actually is

A quick note on the Intel AI Boost NPU since it kept coming up during my research. The NPU is only accessible through OpenVINO — which means Foundry Local is currently the only local inference engine that can use it from the options I tried. But as covered above, all the NPU-optimised models cap at 3,696 input tokens, which is nowhere near enough for the 21k Copilot CLI system prompt. This isn't a software configuration problem — it's the current limit of how the AI Boost NPU processes context in a single pass.

So the NPU is off the table for this use case until Intel ships larger-context NPU models.

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
    )

    if ($providerIdx -eq 0) {
        # Ollama — qwen2.5:7b-instruct-32k is a custom Modelfile with num_ctx 32768
        # Required because default context is too small for the ~21k Copilot CLI system prompt
        $baseUrl = "http://localhost:11434/v1"
        $models  = @(
            [PSCustomObject]@{ Name = "qwen2.5:7b-instruct-32k"; PromptTokens = 32768;  OutputTokens = 8192 }
            [PSCustomObject]@{ Name = "llama3.1:8b";             PromptTokens = 131072; OutputTokens = 8192 }
            [PSCustomObject]@{ Name = "llama3.2:3b";             PromptTokens = 131072; OutputTokens = 8192 }
            #[PSCustomObject]@{ Name = "gemma3:latest";              ... } does not support tools
            #[PSCustomObject]@{ Name = "mistral:7b-instruct-q4_K_M"; ... } does not support tools
        )
    } elseif ($providerIdx -eq 1) {
        # Foundry Local — port is dynamic, detected from service status
        # WARNING: OpenVINO GPU models need Arc driver 32.0.101.8629 (not yet on Dell MC14250)
        # NPU models max out at 3696 tokens — too small for CLI system prompt
        $statusOutput = foundry service status 2>&1
        $foundryUrl = ($statusOutput | Select-String -Pattern 'http://[\d.:]+' | ForEach-Object { $_.Matches[0].Value } | Select-Object -First 1)?.TrimEnd('/')
        if (-not $foundryUrl) {
            Write-Host "Foundry Local service is not running. Starting it..." -ForegroundColor Yellow
            $startOutput = foundry service start 2>&1 | Select-String -Pattern 'http://[\d.:]+'
            $foundryUrl = $startOutput?.Matches[0].Value?.TrimEnd('/')
        }
        if (-not $foundryUrl) {
            $foundryUrl = "http://127.0.0.1:63839"
        }
        $baseUrl = "$foundryUrl/v1"
        $models  = @(
            [PSCustomObject]@{ Name = "qwen2.5-1.5b-instruct-cuda-gpu:4"; PromptTokens = 28672; OutputTokens = 4096 }
            #[PSCustomObject]@{ Name = "qwen2.5-7b-instruct-openvino-gpu:2";  ... } EPContext mismatch - needs driver 32.0.101.8629
            #[PSCustomObject]@{ Name = "qwen2.5-7b-instruct-cuda-gpu:4";      ... } OOM crash on NVIDIA 6GB
        )
    } else {
        # LM Studio — use 127.0.0.1 not localhost (LM Studio binds IPv4 only)
        # Model name is informational only — LM Studio uses whatever is loaded in the server
        # Sweet spot: 25 layers on NVIDIA GDDR + rest on CPU (Arc alone saturates shared memory bus)
        $baseUrl = "http://127.0.0.1:1234/v1"
        $models  = @(
            [PSCustomObject]@{ Name = "qwen2.5-7b-instruct@q5_k_m";  PromptTokens = 32768; OutputTokens = 8192 }
            [PSCustomObject]@{ Name = "qwen2.5.1-coder-7b-instruct";  PromptTokens = 32768; OutputTokens = 8192 }
            [PSCustomObject]@{ Name = "gemma-4-e4b";                   PromptTokens = 65536; OutputTokens = 8192 }
            [PSCustomObject]@{ Name = "qwen2.5-14b-instruct";          PromptTokens = 32768; OutputTokens = 8192 }
        )
        try { $null = Invoke-WebRequest "http://127.0.0.1:1234/v1/models" -TimeoutSec 2 -ErrorAction Stop }
        catch { Write-Warning "LM Studio server not responding. Open LM Studio, load a model, and start the server in the Developer tab." }
    }

    $modelIdx = Invoke-InteractiveMenu -Title "Select model:" -Options ($models | ForEach-Object { $_.Name })
    $selected = $models[$modelIdx]

    $env:COPILOT_PROVIDER_BASE_URL         = $baseUrl
    $env:COPILOT_MODEL                      = $selected.Name
    $env:COPILOT_PROVIDER_MAX_PROMPT_TOKENS = $selected.PromptTokens
    $env:COPILOT_PROVIDER_MAX_OUTPUT_TOKENS = $selected.OutputTokens

    $providerName = @("Ollama", "Foundry Local", "LM Studio")[$providerIdx]
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
| Ollama `qwen2.5:7b-instruct-32k` on NVIDIA | ✅ Works | ~13 tok/s, mediocre quality vs cloud |
| LM Studio `qwen2.5-7b-instruct@q5_k_m`, 25 layers NVIDIA + CPU | ✅ Works | Acceptable speed, similar quality to Ollama |
| Foundry Local on Arc 140T (OpenVINO GPU) | ❌ Blocked | Needs Arc driver 32.0.101.8629 from Dell |
| Foundry Local on NPU | ❌ Too small | 3,696 token limit, CLI needs ~21k |
| Foundry Local CUDA 7B on NVIDIA | ❌ OOM crash | 6 GB isn't enough |
| LM Studio on Arc 140T only (Vulkan) | ❌ Too slow | Saturates shared memory bus, freezes machine |

## What I'm waiting for

The most promising path — Foundry Local with OpenVINO on the Arc 140T — is blocked by a single driver update. The Arc 140T has 16 GB of dedicated VRAM with Intel's optimised INT4 kernels via OpenVINO, and the 7B models should run fast and stable with no memory pressure. Once Dell publishes Arc driver 32.0.101.8629 for the MC14250, that's the first thing I'm testing.

Until then, Ollama with `qwen2.5:7b-instruct-32k` is the most stable local option. And for anything where quality actually matters, `online-copilot` is still the right call.
