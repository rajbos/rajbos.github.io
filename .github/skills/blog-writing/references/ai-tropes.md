# AI writing trope catalogue

Two sources, merged and deduplicated:

- [tropes.fyi/directory](https://tropes.fyi/directory) — a running catalogue of AI writing tells, tagged by category and by whether the pattern is `consistent`, `rising`, `new`, or `fading`.
- [Wikipedia: Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing) — the English Wikipedia editors' guide, focused on encyclopedic prose but the underlying tells generalise.

Last refreshed: 2026-08-26.

---

## Sentence structure

**Negative parallelism** — "It's not X, it's Y", "not because X, but because Y". The most recognisable tell there is. Creates false profundity by framing every statement as a surprise. Once in a piece can work; ten is an insult to the reader.
> "It's not bold. It's backwards."

**Triple negation** — "Not X. Not Y. Just Z." Negating two or three things to build tension before the reveal. Fake narrowing-down-to-truth.
> "Not a bug. Not a feature. A fundamental design flaw."

**Rhetorical Q&A** — a self-posed question answered in the very next clause. Nobody asked it.
> "The result? Devastating."

**Anaphora abuse** — the same sentence opener repeated three or more times in a row.
> "They assume that users will pay... They assume that developers will build... They assume that ecosystems will emerge..."

**Rule of three stacking** — a single tricolon is elegant; three back-to-back is a pattern-matching failure. Often extended to four or five.
> "Products impress people; platforms empower them. Products solve problems; platforms create worlds. Products scale linearly; platforms scale exponentially."

**Comma-clipped trailing phrase** — a short tail hung off a comma instead of landing the point. Sometimes a clipped clause, sometimes a bare noun tacked on as an afterthought.
> "above the content, and save."

**Superficial analysis** — a trailing "-ing" participle phrase that adds no information: "highlighting its significance", "reflecting broader trends", "underscoring the importance of", "ensuring", "fostering", "encompassing". Wikipedia flags this as one of the strongest signals.
> "...the population stood at 56,998 inhabitants, creating a lively community within its borders."

**False ranges** — "from X to Y" where X and Y aren't endpoints on any real spectrum.

---

## Tone

**"Here's the kicker"** — false suspense before an unremarkable point. Also "Here's the thing", "Here's what most people miss".

**"Think of it as..."** — patronising analogy that assumes the reader needs hand-holding.

**"Imagine a world where..."** — invitation to futurism.

**Grandiose stakes inflation** — every argument escalated to world-historical significance. A post about API pricing becomes a meditation on civilisation.
> "This will fundamentally reshape how we think about everything."

**Compulsive counting** — announcing the exact number of items before listing them, as if the count were the achievement.
> "Five things we wish to discuss"

**Invented concept labels** — abstract problem-nouns (paradox, trap, creep, divide, vacuum, inversion) glued to domain words and used as if established: "the supervision paradox", "the acceleration trap", "workload creep". Name a thing, skip the argument. Multiple in one piece is a strong slop signal.

**Vague attributions** — "experts say", "observers have cited", "industry reports", "several publications" with nobody named. Also inflating quantity: presenting one person's view as widely held. If you can't name the expert, you don't have a source.

**Appeal to familiarity** — "a classic", "famously", "notoriously", "as we all know". Borrowing the weight of consensus without evidence. The unnamed authority is the reader's own supposed prior knowledge.

**Promotional language** — prose that sells the subject instead of describing it. Wikipedia's words to watch: *boasts a, vibrant, rich, profound, enhancing, showcasing, exemplifies, commitment to, natural beauty, nestled, in the heart of, groundbreaking, renowned, diverse array*.
> "an all-in-one solution that unlocks unprecedented productivity for teams of any size"

**Undue emphasis on significance and legacy** — puffing up importance by tying arbitrary details to broader trends. Words to watch: *stands/serves as, is a testament to, a pivotal/crucial/key role, underscores its importance, reflects broader, marking a shift, evolving landscape, indelible mark, deeply rooted*.

**Canned emphasis on coverage** — listing where something was covered and what kind of outlet it was, as proof of importance. "maintains an active social media presence" is idiosyncratically AI.

**Quotable one-liners** — a standalone line engineered to sound quotable that carries no information. Slide bait.
> "Story points are a planning tool with no fixed unit."

**Forced figurative language** — a coined metaphor or simile reached for because it sounds clever, not because it clarifies. Often repurposes a word from the prompt as a metaphor for something unrelated.

**Collaborative "we"** — switching a single author's "I" to "we". Signals loss of personal voice, especially bad in a personal journal.

**False vulnerability** — polished, risk-free "honesty" that costs the author nothing.

**"The truth is simple"** — asserting obviousness instead of proving the point.

**"Let's break this down" / "Let's unpack this" / "Let's dive in"** — unnecessary preamble.

---

## Paragraph and section structure

**Short punchy fragments** — very short sentences as standalone paragraphs for manufactured emphasis. No one writes first drafts this way; it doesn't match how people think or speak.
> "He published this. Openly. In a book. As a priest."

**Excessive enumeration (listicle in disguise)** — "The first... The second... The third..." wrapping what is really a list in paragraph clothing.

---

## Composition

**Preamble (announce-then-answer)** — opening with what the text is about to do instead of doing it. Includes structural announcers ("Two constraints shape the design"), throat-clearing frames ("The more important point is..."), and restating the question back.

**Reasoning leak** — narrating the writing's own decisions and deliberation. Chain-of-thought residue that belongs nowhere near the output.
> "What that changes in the design is smaller than it might appear, and what it changes is worth being precise about."

**Premise stacking** — a point preceded by a paragraph of its own supporting evidence, so it's already been made twice before it's stated.

**Belaboring the unnecessary** — defending a minor, uncontroversial point against an objection nobody was going to raise.

**Self-echo** — reusing your own earlier phrase later in the same piece as if paying it off, when it's really a narrow vocabulary resurfacing.

**The tie-back** — closing by restating the answer and looping it back to the original question. "So, to answer your question: yes."

**Never-ending conclusion** — the ending stacks clause after clause instead of landing one point.

**Fractal summaries** — "tell them what you'll say, say it, summarise it" applied at every level. Every subsection gets a summary. So does every section. So does the document.

**Dead metaphor beating** — one metaphor reused five to ten times across a piece.

**Historical analogy stacking** — rapid-fire company or technology history to manufacture authority.

**One-point dilution** — the same argument restated eight different ways across thousands of words.

**Content duplication** — whole sections or paragraphs repeated near-verbatim.

**"Despite its challenges..."** — the rigid formula that raises problems only to immediately dismiss them, usually followed by a vaguely optimistic future outlook. Wikipedia calls out "Challenges and Future Directions" sections specifically.

**The signposted conclusion** — "In conclusion...", "To sum up...", "In summary...".

---

## Formatting

**Em-dash addiction** — compulsive em dashes for dramatic pauses and pivots. A human might use two or three in a whole piece.

**Bold-first bullets** — every list item opening with a bolded phrase. Fading as a tell, but still an instant spot when scanning.

**Title case headings** — capitalising every word instead of sentence case. This repo uses sentence case.

**"Where / What / Why" headers** — headings built on a Wh-word as the default section-naming shape.
> "Where the market is stuck today"

**Unicode decoration** — → arrows, curly quotes, and other non-keyboard characters instead of plain ASCII.

**"X and Y" section headers** — especially "Awards and recognition", "Challenges and legacy", "Future outlook".

---

## Word choice

**"Delve" and friends** — *delve, certainly, utilize, leverage* (as a verb), *robust, streamline, harness, seamless, crucial*.

**"Tapestry" and grand nouns** — *tapestry, landscape, paradigm, synergy, ecosystem, framework*, plus newer entrants *load-bearing* (for important) and *gated* (for restricted).

**Magic adverbs** — *quietly, deeply, fundamentally, remarkably, arguably*, and the "unusually well [X]" construction. Used to make mundane descriptions feel significant.

**"Serves as" dodge** — *serves as, stands as, marks, represents* where "is" would do.

**Synonym cycling** — refusing to repeat a noun, so one dashboard becomes an interface, then a portal, then the analytics hub. Pick one word and stick with it.

**"Where it actually lives"** — framing the true source of something as a physical inhabitance instead of just answering.
> "where the complexity actually lives"

---

## The underlying failure mode

Wikipedia frames it well: LLMs regress to the mean. Specific, unusual, verifiable details get smoothed into generic, positive, important-sounding statements. The subject becomes simultaneously less specific and more exaggerated.

The fix is the same in every case: replace the generic claim with the specific fact. Name the tool, quote the error message, give the version number, link the doc, say what actually broke.
