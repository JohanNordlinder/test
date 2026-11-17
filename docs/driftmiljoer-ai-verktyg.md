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

| Driftmiljö | Beskrivning | Exempel på alternativ |
|---|---|---|
| **Moln** | Verktyget körs som en tjänst hos en extern leverantör, i webbläsaren eller i en molnbaserad utvecklingsmiljö. Koden finns ofta i ett molnrepo. | Claude.ai, ChatGPT, Claude Code på webben, GitHub Codespaces, GitHub Copilot coding agent |
| **Lantmäteriets driftmiljö** | Verktyget körs i miljöer som Lantmäteriet driver. Det finns flera alternativ. | <ul><li>Intern webbtjänst/chatt (t.ex. Open WebUI, LibreChat)</li><li>Virtuell utvecklingsmiljö/VDI med IDE och AI-verktyg</li><li>AI-steg i CI/CD-pipeline (t.ex. kodgranskning, testgenerering)</li><li>Intern AI-gateway som loggar, filtrerar och styr trafik till godkända modeller (t.ex. LiteLLM)</li></ul> |
| **PC** | Verktyget körs på utvecklarens egen dator. Det finns flera alternativ. | <ul><li>IDE-tillägg (t.ex. GitHub Copilot, Continue, Cline, Claude Code för VS Code/JetBrains)</li><li>CLI-agent i terminalen (t.ex. Claude Code CLI, Aider, Codex CLI)</li><li>Fristående skrivbordsapp eller AI-editor (t.ex. Claude Desktop, Cursor, LM Studio)</li></ul> |

> **Obs:** Exemplen ovan illustrerar respektive typ av lösning och är inte en beskrivning av vad som i dag är godkänt eller infört hos Lantmäteriet.

---

## Alla kombinationer

Det finns 3 × 3 = **9 kombinationer**.

Förklaring av kolumnerna:
- **Data lämnar LM:** om kod eller prompter skickas utanför Lantmäteriets kontroll.
- **Modellkvalitet:** förväntad förmåga hos modellen (Hög = de största kommersiella modellerna).
- **Genomförbarhet:** hur realistisk kombinationen är tekniskt och praktiskt.

### Översiktsmatris

| Modell ↓ / Verktyg → | **Moln** | **Lantmäteriets driftmiljö** | **PC** |
|---|---|---|---|
| **Moln** | 1. Helt molnbaserat | 2. Interna verktyg mot molnmodell | 3. Lokala verktyg mot molnmodell |
| **Lantmäteriets driftmiljö** | 4. Molnverktyg mot intern modell | 5. Helt internt | 6. Lokala verktyg mot intern modell |
| **PC** | 7. Molnverktyg mot lokal modell | 8. Interna verktyg mot lokal modell | 9. Helt lokalt |

### Detaljerad tabell

| # | Modell | Verktyg | Data lämnar LM | Modellkvalitet | Genomförbarhet | Kommentar |
|---|---|---|---|---|---|---|
| 1 | Moln | Moln | Ja | Hög | Hög | Enklast att komma igång med, men både kod och prompter hanteras av extern leverantör. Kräver avtal och klassning av data. |
| 2 | Moln | Lantmäteriets driftmiljö | Ja | Hög | Hög | Interna verktyg (t.ex. intern chatt, VDI, pipeline) anropar molnmodell. Ger central inloggning, loggning och kostnadskontroll. En AI-gateway kan maskera känslig information innan den skickas ut. |
| 3 | Moln | PC | Ja | Hög | Hög | Vanligaste upplägget idag, t.ex. Copilot eller Claude Code i IDE eller terminal. CLI-agenter kan köra kommandon lokalt, så behörigheter behöver styras. |
| 4 | Lantmäteriets driftmiljö | Moln | Ja | Medel | Låg | Kräver att intern modell exponeras mot internet för att molnverktyget ska nå den. Säkerhetsmässigt olämpligt och sällan praktiskt. |
| 5 | Lantmäteriets driftmiljö | Lantmäteriets driftmiljö | Nej | Medel | Hög | Både verktyg och modell ligger internt. Stark säkerhetsprofil och lämpligt för känslig information. |
| 6 | Lantmäteriets driftmiljö | PC | Nej | Medel | Hög | Lokala verktyg som stöder egna endpoints (t.ex. Continue, Cline, Aider) konfigureras mot intern modell. Agentförmågan beror på modellens kvalitet. |
| 7 | PC | Moln | Nej/Ja* | Låg–medel | Låg | Molnverktyg kan normalt inte nå en modell på utvecklarens PC. *Kod kan ändå ligga i molnverktyget. Sällan relevant. |
| 8 | PC | Lantmäteriets driftmiljö | Nej | Låg–medel | Låg | Centrala tjänster som anropar modeller på enskilda PC:ar är ovanligt, svårt att förvalta och ger ingen tydlig nytta. |
| 9 | PC | PC | Nej | Låg–medel | Medel | Helt offline. Kräver kraftfull dator (GPU/mycket minne). Lämpar sig för enkel kodkomplettering och experiment, men små modeller klarar sällan komplexa agentflöden. |

---

## Sammanfattning

- **Mest realistiska kombinationer:** 1, 2 och 3 (molnmodell) samt 5 och 6 (intern modell).
- **Högst modellkvalitet:** kombinationer med molnmodell (1–3), där data lämnar organisationen.
- **Högst dataskydd med rimlig kvalitet:** intern modell i Lantmäteriets driftmiljö (5–6).
- **Lokal modell på PC (7–9):** främst lämplig för experiment eller enkel kodkomplettering offline.
- **Kombination 4, 7 och 8:** tekniskt möjliga men i praktiken olämpliga eller utan tydlig nytta, eftersom verktyget måste nå en modell i en miljö som det normalt inte kommer åt.
- En **intern AI-gateway** kan kombineras med de flesta alternativ och ger en central punkt för styrning, loggning och val mellan intern modell och molnmodell beroende på datans klassning.
