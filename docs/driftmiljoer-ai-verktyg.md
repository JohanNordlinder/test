# Driftmiljöer för AI-verktyg inom systemutveckling

Det här dokumentet beskriver vilka kombinationer av driftmiljöer som är möjliga när AI-verktyg används i systemutveckling. Ett AI-verktyg består av två delar som kan köras på olika ställen:

1. **Modellen**: själva språkmodellen (LLM) som tolkar frågor och genererar kod och text.
2. **Verktyget**: programmet som utvecklaren arbetar i. Det samlar in kontext (kod, filer, terminalutdata), skickar den till modellen och tillämpar svaren, till exempel som kodförslag, ändringar i filer eller körda kommandon.

Var de två delarna körs avgör vilken data som lämnar organisationen, vilka modeller som kan användas, vilken prestanda man får och vem som ansvarar för drift och säkerhet.

---

## Förklaring av rubrikerna

### [Modell]: var språkmodellen körs

| Driftmiljö | Beskrivning | Exempel |
|---|---|---|
| **Moln** | Modellen körs hos en extern leverantör och nås via ett API över internet. Ger tillgång till de största och mest kapabla modellerna utan egen hårdvara. Data (prompter och kod) skickas till leverantören. | Anthropic API (Claude), OpenAI API, Azure OpenAI, AWS Bedrock, Google Vertex AI |
| **Lantmäteriets driftmiljö** | Modellen körs på servrar som Lantmäteriet själv driver eller kontrollerar (on-prem eller privat moln). Data lämnar inte organisationen, men modellvalet begränsas till modeller med öppna vikter och kräver GPU-kapacitet och egen förvaltning. | Öppna modeller (t.ex. Llama, Mistral, Qwen) som serveras med vLLM, Ollama eller TGI |
| **PC** | Modellen körs lokalt på utvecklarens egen dator. Helt offline och ingen data lämnar datorn, men hårdvaran begränsar modellstorleken, och därmed kvaliteten och hastigheten. | Ollama, LM Studio, llama.cpp med mindre modeller |

### [Verktyg]: var utvecklarverktyget körs

| Driftmiljö | Alternativ | Beskrivning | Exempel |
|---|---|---|---|
| **Moln** | – | Verktyget körs som en tjänst hos en extern leverantör, i webbläsaren eller i en molnbaserad utvecklingsmiljö. Koden finns ofta i ett molnrepo. | Claude.ai, ChatGPT, Claude Code på webben, GitHub Codespaces, GitHub Copilot coding agent |
| **Lantmäteriets driftmiljö** | **L1. Intern webbtjänst / chatt** | Ett internt webbgränssnitt (chatt) som driftas av Lantmäteriet. | Open WebUI, LibreChat eller en egenutvecklad portal |
| | **L2. Virtuell utvecklingsmiljö (VDI / fjärrskrivbord)** | Utvecklaren arbetar i en virtuell dator eller fjärrmiljö i Lantmäteriets driftmiljö, där IDE och AI-verktyg är installerade. | VDI med VS Code/JetBrains, VS Code Remote, Coder |
| | **L3. CI/CD-pipeline / automatiserade agenter** | AI-verktyget körs automatiskt i byggkedjan, t.ex. för kodgranskning, testgenerering eller dokumentation. | Agent i GitLab CI, Jenkins eller Azure DevOps on-prem |
| | **L4. Intern AI-gateway / proxy** | En central tjänst som tar emot anrop från utvecklarnas verktyg, loggar, filtrerar (t.ex. maskerar känslig data) och styr trafiken till godkända modeller. | LiteLLM, Kong AI Gateway, egen API-gateway |
| **PC** | **P1. IDE-tillägg** | Ett tillägg i utvecklarens editor som ger kodkomplettering, chatt och agentfunktioner. | GitHub Copilot, Continue, Cline, Claude Code-tillägg för VS Code/JetBrains |
| | **P2. Kommandoradsverktyg (CLI-agent)** | En agent i terminalen som läser och ändrar filer och kör kommandon i det lokala repot. | Claude Code CLI, Aider, OpenAI Codex CLI |
| | **P3. Fristående skrivbordsapplikation** | En separat app för chatt eller agentarbete, ibland en egen AI-anpassad editor. | Claude Desktop, Cursor, LM Studio (chatt) |

> **Obs:** Exemplen ovan illustrerar respektive typ av lösning och är inte en beskrivning av vad som i dag är godkänt eller infört hos Lantmäteriet.

---

## Alla kombinationer

Det finns 3 × 3 = 9 grundkombinationer. Med underalternativen för Lantmäteriets driftmiljö (L1–L4) och PC (P1–P3) blir det 3 × (1 + 4 + 3) = **24 kombinationer**.

Förklaring av kolumnerna:
- **Data lämnar LM:** om kod eller prompter skickas utanför Lantmäteriets kontroll.
- **Modellkvalitet:** förväntad förmåga hos modellen (Hög = de största kommersiella modellerna).
- **Genomförbarhet:** hur realistisk kombinationen är tekniskt och praktiskt.

### Översiktsmatris (grundkombinationer)

| Modell ↓ / Verktyg → | **Moln** | **Lantmäteriets driftmiljö** | **PC** |
|---|---|---|---|
| **Moln** | 1. Helt molnbaserat | 2. Interna verktyg mot molnmodell | 3. Lokala verktyg mot molnmodell |
| **Lantmäteriets driftmiljö** | 4. Molnverktyg mot intern modell | 5. Helt internt | 6. Lokala verktyg mot intern modell |
| **PC** | 7. Molnverktyg mot lokal modell | 8. Interna verktyg mot lokal modell | 9. Helt lokalt |

### Detaljerad tabell (alla kombinationer)

| # | Modell | Verktyg | Alternativ | Data lämnar LM | Modellkvalitet | Genomförbarhet | Kommentar |
|---|---|---|---|---|---|---|---|
| 1 | Moln | Moln | – | Ja | Hög | Hög | Enklast att komma igång med, men både kod och prompter hanteras av extern leverantör. Kräver avtal och klassning av data. |
| 2a | Moln | LM driftmiljö | L1. Intern webbtjänst | Ja (prompter) | Hög | Hög | Intern chatt som anropar molnmodell. Ger central inloggning, loggning och kostnadskontroll. |
| 2b | Moln | LM driftmiljö | L2. VDI / fjärrmiljö | Ja (kodkontext) | Hög | Medel | Kräver att VDI-miljön får nå leverantörens API. Koden ligger kvar internt men kontext skickas ut. |
| 2c | Moln | LM driftmiljö | L3. CI/CD-pipeline | Ja (kodkontext) | Hög | Hög | Automatiserad granskning eller generering i pipeline med molnmodell. |
| 2d | Moln | LM driftmiljö | L4. AI-gateway | Ja (filtrerat) | Hög | Hög | Gatewayen kan maskera känslig information och logga all trafik innan den går till molnmodellen. Kombineras ofta med P1–P3. |
| 3a | Moln | PC | P1. IDE-tillägg | Ja (kodkontext) | Hög | Hög | Vanligaste upplägget idag, t.ex. Copilot eller Claude Code i VS Code. |
| 3b | Moln | PC | P2. CLI-agent | Ja (kodkontext) | Hög | Hög | Kraftfulla agentflöden. Agenten kan köra kommandon lokalt, så behörigheter behöver styras. |
| 3c | Moln | PC | P3. Skrivbordsapp | Ja | Hög | Hög | Chatt eller AI-editor lokalt med molnmodell. |
| 4 | LM driftmiljö | Moln | – | Ja | Medel | Låg | Kräver att intern modell exponeras mot internet för att molnverktyget ska nå den. Säkerhetsmässigt olämpligt och sällan praktiskt. |
| 5a | LM driftmiljö | LM driftmiljö | L1. Intern webbtjänst | Nej | Medel | Hög | Helt intern chatt. Bra för känslig information. |
| 5b | LM driftmiljö | LM driftmiljö | L2. VDI / fjärrmiljö | Nej | Medel | Hög | Hela utvecklingsmiljön och modellen ligger internt. Stark säkerhetsprofil. |
| 5c | LM driftmiljö | LM driftmiljö | L3. CI/CD-pipeline | Nej | Medel | Hög | Automatiserade AI-steg utan att data lämnar organisationen. |
| 5d | LM driftmiljö | LM driftmiljö | L4. AI-gateway | Nej | Medel | Hög | Gateway framför interna modeller ger enhetligt API, behörighetsstyrning och loggning. |
| 6a | LM driftmiljö | PC | P1. IDE-tillägg | Nej | Medel | Hög | IDE-tillägg (t.ex. Continue, Cline) konfigurerat mot intern modellendpoint. |
| 6b | LM driftmiljö | PC | P2. CLI-agent | Nej | Medel | Medel | Fungerar med verktyg som stöder egna endpoints (t.ex. Aider). Agentförmågan beror på modellens kvalitet. |
| 6c | LM driftmiljö | PC | P3. Skrivbordsapp | Nej | Medel | Hög | Lokal chattapp eller AI-editor mot intern modell. |
| 7 | PC | Moln | – | Nej/Ja* | Låg–medel | Låg | Molnverktyg kan normalt inte nå en modell på utvecklarens PC. *Kod kan ändå ligga i molnverktyget. Sällan relevant. |
| 8a | PC | LM driftmiljö | L1. Intern webbtjänst | Nej | Låg–medel | Låg | En central tjänst som anropar modeller på enskilda PC:ar är ovanligt och svårt att förvalta. |
| 8b | PC | LM driftmiljö | L2. VDI / fjärrmiljö | Nej | Låg–medel | Låg | VDI-miljön skulle behöva nå klientdatorns modell. Tekniskt möjligt men opraktiskt. |
| 8c | PC | LM driftmiljö | L3. CI/CD-pipeline | Nej | Låg–medel | Låg | Pipelines bör inte bero på enskilda utvecklares datorer. |
| 8d | PC | LM driftmiljö | L4. AI-gateway | Nej | Låg–medel | Låg | Gateway som routar till PC-modeller. Teoretiskt möjligt men ger ingen tydlig nytta. |
| 9a | PC | PC | P1. IDE-tillägg | Nej | Låg–medel | Medel | Helt offline. Kräver kraftfull dator (GPU/mycket minne). Lämpar sig för enkel kodkomplettering. |
| 9b | PC | PC | P2. CLI-agent | Nej | Låg | Låg–medel | Små lokala modeller klarar sällan komplexa agentflöden. |
| 9c | PC | PC | P3. Skrivbordsapp | Nej | Låg–medel | Medel | T.ex. LM Studio eller Ollama med chattgränssnitt. Bra för experiment. |

---

## Sammanfattning

- **Mest realistiska kombinationer:** 1, 2a–2d, 3a–3c (molnmodell) samt 5a–5d och 6a–6c (intern modell).
- **Högst modellkvalitet:** kombinationer med molnmodell (1–3), där data lämnar organisationen.
- **Högst dataskydd med rimlig kvalitet:** intern modell i Lantmäteriets driftmiljö (5–6).
- **Lokal modell på PC (7–9):** främst lämplig för experiment eller enkel kodkomplettering offline.
- **Kombination 4, 7 och 8:** tekniskt möjliga men i praktiken olämpliga eller utan tydlig nytta, eftersom verktyget måste nå en modell i en miljö som normalt inte är åtkomlig därifrån.
- En **AI-gateway (L4)** kan kombineras med de flesta andra alternativ och ger en central punkt för styrning, loggning och val mellan intern modell och molnmodell beroende på datans klassning.
