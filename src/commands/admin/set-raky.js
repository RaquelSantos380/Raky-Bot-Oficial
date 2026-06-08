import { PREFIX } from "../../config.js";
import {
  setWelcomeMessage,
  setWelcomeRules,
  isActiveWelcomeGroup,
  activateWelcomeGroup,
} from "../../utils/database.js";

const MENSAGEM_PADRAO = `━━━━━━━ •🌸• ━━━━━━━

🌸 *BEM-VINDO(A)AO RAKY CENTER*🛍️
~
📖 *Leia as regras para garantir uma boa convivência.*  
💬 *Participe das conversas e impulsione suas vendas e trocas.*  

*🌷 Qualquer dúvida, fale com a Dona ou com algum adm!* 🌷  

*Boas trocas e vendas a você !* 🛍️✨

    ━━━━━━━ •🌸• ━━━━━━━`;

const REGRAS_PADRAO = `🌸 *LEIAM AS REGRAS DO GRUPO!* 🌸

⚠️ *Infração* = 📢 *+1 aviso*
⚠️ *3 avisos* = ☁️ *BAN permanente*

- *REGRAS:* 🎀

 - *Evitar julgar o valor do próximo*
 - *Grupo com foco em Adopt Me!*
 - *🐶 evitar fugir do tema, flodar ou discutir sobre assuntos de outros grupos ❌*
 - *Evitar vendas de outros jogos que não se relacionem ao Adopt Me 🎀*
 - *Evite política 🗽*
 - *Sem conteúdo adulto*
 - *Respeite os ADMs e Membros*
 - *Nada de fotos pessoais sem permissão 🌷*
 - *Links só com permissão ADM 🎀*
 - *Proibido comércio de contas/robux ou grupos 💌*
 - *Faça MIDDLE em transações de risco 💱*
 - *Apenas os ADMS do grupo realizam os Middles*
 - *Seja gentil!*
 - *Sem intrigas/fofocas maldosas 🙏🏻*
 - *Não ligue sem permissão* 📞
 - *Sem Rifas* 🐹
 - *Leilões são permitidos (avise com antecedência)🗣️*

- *ADMs DISPONÍVEIS* ✅👑
*Raquel  Karenzinha  Larah*  
*Joao Matos*  *Erika*   *Diana* 

🎀 *Agradecemos pela colaboração!*
📩 *Caso de dúvida, chame algum ADM no pv! 🙏🏻☺️*`;

export default {
  name: "setup-rakycenter",
  description: "Configura o welcome padrão do Raky Center.",
  commands: ["setup-rakycenter", "setupraky", "rakycenter"],
  usage: `${PREFIX}setup-rakycenter`,

  handle: async ({ remoteJid, sendSuccessReact, sendReply }) => {
    setWelcomeMessage(remoteJid, MENSAGEM_PADRAO);
    setWelcomeRules(remoteJid, REGRAS_PADRAO);
    activateWelcomeGroup(remoteJid);
    
    await sendSuccessReact();
    return sendReply(
      "✅ *Raky Center configurado!*\n\n" +
      "📝 Mensagem de boas-vindas: OK\n" +
      "📖 Regras: OK\n" +
      "🟢 Welcome: ATIVADO\n\n" +
      "📸 Para colocar a imagem, responda uma foto com:\n" +
      "`/set-welcome imagem`"
    );
  },
};