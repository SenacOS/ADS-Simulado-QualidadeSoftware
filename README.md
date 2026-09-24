# 🧪 ADS-Simulado-QualidadeSoftware — Resumo e Simulado: Qualidade de Software

Site interativo desenvolvido como material de estudo para a disciplina de Qualidade de Software, do curso de Análise e Desenvolvimento de Sistemas (ADS) — Senac.

## 📋 Sobre o Projeto

O site reúne, em uma única página, teoria completa de 7 conteúdos e um questionário próprio para cada um deles — ao todo, 142 questões, majoritariamente de múltipla escolha, com 2 dissertativas por conteúdo. O conteúdo das aulas foi **reorganizado por assunto**, e não pela ordem cronológica das aulas. A interface possui tema claro e escuro e navegação por menu com âncoras.

## 🧩 Conteúdos Abordados

**1. Fundamentos de Qualidade de Software**
- O que é qualidade, QA × QC × Teste, verificação × validação
- ISO/IEC 25010, custo da qualidade e Shift-Left
- Maturidade, confiabilidade, métricas e glossário erro/defeito/falha

**2. ATAM, Utility Tree e Cenários de Qualidade**
- ATAM e árvore de utilidade
- Cenário de atributo de qualidade em seis partes
- Anatomia do caso de teste, rastreabilidade e plano de teste

**3. Arquitetura para Qualidade**
- Framework Fato/Lacuna/Suposição/Decisão e modelo C4
- Fluxos online e batch, táticas de Len Bass
- Governança de IA agêntica em análise arquitetural

**4. Técnicas de Projeto de Teste**
- Caixa preta, branca e cinza
- Critérios de cobertura (comando, ramo, condição)
- Partição de equivalência, valor limite, tabela de decisão e mutação

**5. Gestão de Defeitos**
- Vocabulário causal (erro, defeito, falha, incidente)
- Relato reproduzível, severidade × prioridade, triagem e ciclo de vida
- Causa raiz (5 porquês) e fluxo de correção seguro

**6. Integração Contínua**
- O que é CI de fato e modelo do GitHub Actions
- Workflow mínimo em Java 21, segurança de pipeline e branch protection
- Diagnóstico operacional

**7. Testes Avançados e Cobertura**
- JUnit Jupiter e relógio determinístico
- O que a cobertura mede, gate com JaCoCo
- SonarCloud e Quality Gate no pull request

## ⚙️ Como Usar

O simulado está disponível online e pode ser acessado diretamente pelo navegador através do GitHub Pages, sem necessidade de instalação ou configuração adicional.

1. Acesse o link do projeto: [SenacOS.github.io/ADS-Simulado-QualidadeSoftware/](https://SenacOS.github.io/ADS-Simulado-QualidadeSoftware/)
2. Use o **Sumário** ou o menu no topo para ir ao conteúdo desejado.
3. Leia a teoria do conteúdo e, ao final dela, clique em **Iniciar simulado**.
4. As alternativas e a ordem das questões são embaralhadas a cada início; o feedback de cada resposta é imediato, com justificativa.
5. As questões dissertativas não têm correção automática: envie sua resposta e compare com o gabarito comentado.

### Executar localmente

Não há build nem dependências, mas o conteúdo é carregado via `fetch`, então é necessário servir a pasta por um servidor estático (abrir `index.html` direto do disco não funciona):

```bash
python3 -m http.server 8000
# depois acesse http://localhost:8000
```

## 🛠️ Tecnologias

- HTML5 semântico
- CSS3 (tema claro/escuro, variáveis CSS, responsividade, sem framework)
- JavaScript Vanilla (renderização dinâmica do conteúdo e dos simulados, lógica de correção), sem dependências e sem build step

## 📁 Estrutura

```text
├── index.html                  # casca da página (header, hero, sumário, fontes, footer)
├── css/
│   └── style.css               # design system (cores, tipografia, layout)
├── js/
│   ├── app.js                  # monta menu, sumário, capítulos e simulados a partir de chapters.json
│   ├── quiz.js                 # motor do quiz: embaralhamento, correção, progresso
│   ├── nav.js                  # menu hambúrguer
│   └── theme.js                # toggle de tema claro/escuro
└── content/
    ├── chapters.json           # lista e ordem dos conteúdos
    ├── theory/                 # um arquivo HTML de teoria por conteúdo
    └── questions/              # um arquivo JSON de questões por conteúdo
```

## ✏️ Manutenção do conteúdo

**Editar teoria:** altere o arquivo do conteúdo em `content/theory/`.

**Adicionar, remover ou editar questões:** altere o JSON do conteúdo em `content/questions/`. Cada questão segue um dos formatos:

```json
{ "type": "mc", "q": "Enunciado", "options": ["A", "B", "C", "D"], "correct": 0, "explanation": "Por quê." }
{ "type": "dissertativa", "q": "Enunciado", "expected": "Resposta esperada / gabarito comentado." }
```

Em `mc`, `correct` é o índice da alternativa correta **antes** do embaralhamento (o gabarito nunca muda de lugar).

**Adicionar um conteúdo novo:** crie `content/theory/NN-slug.html` e `content/questions/NN-slug.json` e registre uma entrada em `content/chapters.json` (`id`, `slug`, `label`, `short`, `toc`). Menu, sumário, capítulo, simulado e lista de fontes são gerados automaticamente.

## 📚 Fonte

O conteúdo teórico foi construído a partir das aulas da disciplina de Qualidade de Software (ADS — Senac), reorganizado pedagogicamente por assunto. As questões e o resumo servem como material de apoio para fins de estudo e revisão.

## 📄 Licença

Este repositório é distribuído sob a licença MIT (veja [LICENSE](LICENSE)).

---

Projeto desenvolvido como ferramenta de revisão para a disciplina de Qualidade de Software — ADS Senac, 2026.
