# Segurança, LGPD, Fraude e Riscos Regulatórios

## 1. Aviso importante

Este documento é uma análise técnica e estratégica inicial. Não substitui consultoria jurídica, regulatória ou de segurança.

Como o produto envolve dados pessoais, despesas, comprovantes e Pix, é obrigatório tratar segurança e privacidade desde o MVP.

## 2. Escopo do MVP

No MVP, o produto deve evitar atuar como instituição financeira.

O MVP deve:

- registrar despesas;
- calcular rateios;
- mostrar saldos;
- preparar Pix manual;
- permitir comprovante;
- marcar status de pagamento;
- preservar auditoria.

O MVP não deve:

- custodiar dinheiro;
- abrir conta;
- movimentar saldo;
- executar Pix automaticamente;
- iniciar pagamento via Open Finance;
- acessar extrato bancário;
- prometer liquidação bancária;
- oferecer crédito;
- oferecer investimento;
- fazer câmbio;
- operar como carteira.

## 3. LGPD — Dados pessoais

O produto tratará dados pessoais como:

- nome;
- telefone;
- mensagens;
- relações entre membros;
- despesas;
- comprovantes;
- chaves Pix;
- logs;
- metadados de uso;
- consentimentos.

Alguns dados podem ser sensíveis no contexto prático mesmo que não sejam “dados sensíveis” no sentido jurídico estrito, porque revelam hábitos, relações e vida financeira.

## 4. Papéis LGPD

Em geral, o produto tende a atuar como controlador dos dados da própria plataforma, porque decide meios e finalidades do tratamento.

Terceiros como:

- provedor de WhatsApp/API;
- provedor de nuvem;
- provedor de storage;
- provedor de IA;
- provedor de e-mail;
- parceiro Open Finance futuro;

podem atuar como operadores ou controladores independentes, dependendo do contrato e finalidade.

Isso precisa ser validado juridicamente.

## 5. Bases legais possíveis

Possíveis bases legais por finalidade:

## 5.1 Execução de contrato

Para:

- criar conta;
- prestar serviço;
- registrar despesas;
- calcular saldos;
- gerenciar Espaços;
- enviar notificações funcionais.

## 5.2 Consentimento

Para:

- comunicações opcionais;
- conexão Open Finance futura;
- processamento de áudio/OCR quando necessário;
- uso de dados para melhoria de IA, se não for estritamente necessário;
- marketing.

## 5.3 Legítimo interesse

Pode ser avaliado para:

- prevenção a fraude;
- segurança;
- melhoria do produto;
- métricas agregadas.

Precisa de teste de balanceamento.

## 5.4 Cumprimento de obrigação legal/regulatória

Pode aparecer futuramente se houver relação com parceiros financeiros, pagamentos regulados ou retenção exigida.

## 6. Direitos do titular

O produto precisa ter processo para:

- acesso aos dados;
- correção;
- exclusão, quando aplicável;
- portabilidade, quando aplicável;
- revogação de consentimento;
- informação sobre compartilhamento;
- oposição ao tratamento, quando aplicável.

No MVP, pelo menos criar canal de contato claro.

## 7. Minimização de dados

Coletar só o necessário.

P0:

- telefone;
- nome;
- mensagens relacionadas ao produto;
- despesas;
- membros;
- chaves Pix opcionais;
- comprovantes opcionais;
- logs técnicos necessários;
- consentimentos.

Não coletar:

- CPF, salvo necessidade real futura;
- endereço;
- renda;
- senha bancária;
- token;
- CVV;
- código de autenticação;
- extrato bancário no MVP.

## 8. Segurança de dados

Obrigatório:

- HTTPS;
- criptografia em repouso para arquivos;
- URLs temporárias para comprovantes;
- controle de acesso por Espaço;
- logs sem segredos;
- variáveis de ambiente;
- rotação de secrets;
- backup;
- rate limit;
- proteção contra brute force;
- validação de entrada;
- idempotência;
- auditoria;
- monitoramento de erros.

## 9. Segurança no WhatsApp

Riscos:

- número errado;
- celular de outra pessoa;
- mensagem encaminhada;
- print sensível;
- golpe;
- engenharia social.

Controles:

- confirmar entrada por número;
- convite individual;
- link com validade;
- uso único;
- revogação;
- não mostrar dados financeiros antes do aceite;
- não pedir código bancário;
- notificar mudanças importantes;
- permitir remover membro.

## 10. Segurança na IA

Riscos:

- prompt injection;
- interpretação errada;
- alucinação;
- vazamento de dados;
- ação sem autorização.

Controles:

- IA não altera banco diretamente;
- tool calling com schema;
- validação backend;
- confirmação em operação ambígua;
- recusa segura;
- testes de prompt injection;
- logs de intenção;
- separação de contexto por Espaço;
- não enviar dados desnecessários para o LLM.

## 11. Segurança no Pix manual

Riscos:

- Pix para pessoa errada;
- valor errado;
- golpe;
- comprovante falso;
- duplicidade;
- confusão de status.

Controles:

- revisão de recebedor;
- revisão de valor;
- descrição;
- Espaço;
- status claro;
- comprovante;
- confirmação pelo recebedor;
- idempotência;
- não dizer “liquidado” sem prova real.

Mensagem obrigatória:

> O pagamento acontece no seu banco. Este sistema apenas prepara os dados e registra o status no Espaço.

## 12. Fraudes possíveis

## 12.1 Despesa falsa

Usuário registra gasto que não existiu.

Controles:

- histórico visível;
- contestação;
- comprovante;
- notificação;
- organizador/participantes podem revisar.

## 12.2 Comprovante falso

Usuário envia imagem falsa.

Controles:

- recebedor confirma;
- OCR não deve confiar sozinho;
- status “marcado como pago” separado de “confirmado”.

## 12.3 Convite encaminhado

Pessoa errada tenta entrar.

Controles:

- convite individual;
- uso único;
- validade;
- confirmação de número;
- organizador pode remover.

## 12.4 Dívida zerada por comando malicioso

Usuário tenta manipular IA.

Controles:

- backend valida;
- ledger imutável;
- ajuste auditado;
- IA não executa alteração direta.

## 12.5 Pagamento duplicado

Usuário gera Pix repetido.

Controles:

- idempotência;
- status;
- alerta de pagamento pendente semelhante;
- histórico de Pix gerado.

## 13. Risco regulatório — Pix e Open Finance

No MVP, manter Pix manual.

Não se posicionar como:

- instituição de pagamento;
- iniciador de pagamento;
- carteira;
- conta digital;
- custodiante.

Para Open Finance ou iniciação Pix futura:

- usar parceiro regulado;
- obter consentimento explícito;
- respeitar escopos;
- manter logs;
- nunca compartilhar extrato completo com o grupo;
- separar leitura de dados e iniciação de pagamento.

## 14. Linguagem proibida no MVP

Evitar:

- “pague automaticamente”;
- “movimentamos seu dinheiro”;
- “conectamos seu banco agora”;
- “pagamento liquidado” sem confirmação real;
- “garantimos que recebeu”;
- “conta digital compartilhada”;
- “carteira do grupo”.

Usar:

- “preparamos o Pix”;
- “você paga no seu banco”;
- “marcado como pago no Espaço”;
- “recebedor pode confirmar”;
- “comprovante anexado”.

## 15. Política de retenção inicial

Sugestão MVP:

- dados de conta: enquanto usuário estiver ativo;
- despesas e ledger: manter enquanto Espaço existir e por prazo razoável depois;
- comprovantes: permitir exclusão/ocultação conforme política, preservando metadados mínimos quando necessário;
- logs técnicos: retenção curta;
- audit logs financeiros: retenção maior, com minimização.

Validar com jurídico.

## 16. Checklist de segurança para MVP privado

- [ ] HTTPS.
- [ ] `.env` fora do git.
- [ ] `.env.example` sem segredo.
- [ ] Convite com token hash.
- [ ] Convite expira.
- [ ] Convite uso único.
- [ ] Permissão por Espaço.
- [ ] Auditoria financeira.
- [ ] Idempotência.
- [ ] Não usa float.
- [ ] Não pede senha/token/CVV.
- [ ] Arquivos privados.
- [ ] URL temporária para comprovante.
- [ ] Logs sem dados sensíveis.
- [ ] Prompt injection testado.
- [ ] Backup do banco.
- [ ] Rate limit.
- [ ] Canal de contato para privacidade.

## 17. Checklist antes de beta público

- [ ] Termos de uso.
- [ ] Política de privacidade.
- [ ] Registro de consentimentos.
- [ ] Encarregado/canal LGPD definido.
- [ ] Revisão jurídica.
- [ ] Revisão de segurança.
- [ ] Monitoramento de incidentes.
- [ ] Processo de exclusão de dados.
- [ ] Processo de exportação/acesso.
- [ ] Processo de resposta a incidente.
- [ ] Revisão de contratos com provedores.

## 18. Incidentes

Criar procedimento simples:

1. identificar incidente;
2. conter;
3. avaliar dados afetados;
4. corrigir;
5. registrar;
6. notificar, se aplicável;
7. revisar prevenção.

## 19. Fontes oficiais para consulta

Consultar sempre as versões atuais:

- Lei Geral de Proteção de Dados Pessoais — Lei nº 13.709/2018;
- Autoridade Nacional de Proteção de Dados;
- Banco Central do Brasil — Pix;
- Banco Central do Brasil — Open Finance;
- Open Finance Brasil;
- Meta Developers — WhatsApp Business Platform.

## 20. Decisão recomendada

Para o MVP:

- sem Open Finance;
- sem iniciação Pix;
- sem custódia;
- sem conta digital;
- sem promessa de liquidação automática;
- foco em registro, rateio, ledger e Pix manual.

Essa decisão reduz risco regulatório e aumenta velocidade de validação.
