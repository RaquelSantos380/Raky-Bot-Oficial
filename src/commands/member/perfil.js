import fs from "fs";
import path from "path";

const BRINCADEIRA_FILE = path.resolve("database", "modo-brincadeira.json");

function isModoBrincadeiraAtivo(remoteJid) {
  try {
    if (fs.existsSync(BRINCADEIRA_FILE)) {
      const config = JSON.parse(fs.readFileSync(BRINCADEIRA_FILE, "utf8"));
      return !!config[remoteJid];
    }
  } catch (e) {}
  return false;
}

import { ASSETS_DIR, PREFIX } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";
import { getProfileImageData } from "../../services/baileys.js";
import { isGroup, onlyNumbers } from "../../utils/index.js";
import { errorLog } from "../../utils/logger.js";

// Frases aleatórias engraçadas
const FRASES = [
  "💸 Deve até o ar que respira",
  "🐮 Gado nível: lendário",
  "🎪 Fugiu do circo mas continua palhaço(a)",
  "🧠 Último neurônio pedindo demissão",
  "🔥 Tá pegando fogo... na fofoca",
  "🍪 Biscoiteiro(a) profissional",
  "🎭 Dramático(a) nível novela mexicana",
  "🛒 Tá na promoção do dia",
  "💀 Enterrado(a) nos grupos",
  "👻 Aparece mais que assombração",
  "🥇 Medalha de ouro em sumir",
  "🦥 Velocidade: lesma com cãibra",
  "🎰 Sorte: a mesma que achar WiFi grátis",
  "☕ Fofoqueiro(a): sim, com certeza",
  "📱 Online 25h por dia",
  "🤡 Palhaço(a) oficial do grupo",
  "🦄 Unicórnio raro de se ver",
  "🪑 Já virou móvel do grupo",
  "🧊 Frio(a) como gelo da Antártida",
];

const APELIDOS = [
  "Zé Preguiça", "Maria Fofoca", "João Sem Braço", "Tonhão da Net",
  "Cleitin Ilumidado", "Xeroque Rolmes", "Mestre dos Magos", "Dona Encrenca",
  "Rei da Resenha", "Rainha do Zap", "Capitão Óbvio", "Professor Pardal",
];

export default {
  name: "perfil",
  description: "Mostra informações engraçadas de um usuário",
  commands: ["perfil", "profile"],
  usage: `${PREFIX}perfil ou perfil @usuario`,
  handle: async ({
    args,
    socket,
    remoteJid,
    userLid,
    sendErrorReply,
    sendWaitReply,
    sendSuccessReact,
    sendReply,
  }) => {
    try {
      // Verifica modo brincadeira
      if (isModoBrincadeiraAtivo(remoteJid)) {
        const gm = await socket.groupMetadata(remoteJid);
        const p = gm.participants.find(p => p.id === userLid);
        if (p?.admin !== "admin" && p?.admin !== "superadmin") {
          return sendReply("🎮 Apenas ADMINS podem usar este comando!");
        }
      }

      if (!isGroup(remoteJid)) {
        throw new InvalidParameterError("Este comando só pode ser usado em grupo.");
      }

      const targetLid = args[0] ? `${onlyNumbers(args[0])}@lid` : userLid;

      await sendWaitReply("🔍 Investigando a vida alheia...");

      let profilePicUrl;
      let userRole = "Membro";

      try {
        const { profileImage } = await getProfileImageData(socket, targetLid);
        profilePicUrl = profileImage || `${ASSETS_DIR}/images/default-user.png`;
      } catch (error) {
        profilePicUrl = `${ASSETS_DIR}/images/default-user.png`;
      }

      const groupMetadata = await socket.groupMetadata(remoteJid);
      const participant = groupMetadata.participants.find(p => p.id === targetLid);
      
      if (participant?.admin === "superadmin") userRole = "👑 Dono(a)";
      else if (participant?.admin === "admin") userRole = "🛡️ Administrador(a)";
      else userRole = "👤 Membro";

      // Gera dados aleatórios mas consistentes (baseados no LID)
      const seed = targetLid.split("@")[0].split("").reduce((a, b) => a + parseInt(b || "0"), 0);
      
      const gadoPercent = (seed * 7) % 101;
      const passivaPercent = (seed * 13) % 101;
      const beleza = (seed * 17) % 101;
      const programPrice = ((seed * 31) % 5000 + 500).toFixed(2);
      const fofocaLevel = (seed * 11) % 101;
      const onlineHrs = (seed % 24) + 1;
      const sono = (seed * 19) % 101;
      const humor = ["😊 Feliz", "😤 Bravo(a)", "🤪 Doido(a)", "😴 Com sono", "🤔 Confuso(a)", "😈 Malvado(a)", "🤗 Carinhoso(a)"][seed % 7];
      const frase = FRASES[seed % FRASES.length];
      const apelido = APELIDOS[seed % APELIDOS.length];

      const mensagem = `📋 *PERFIL COMPLETO*

👤 *Nome:* @${targetLid.split("@")[0]}
🏷️ *Apelido:* ${apelido}
🎖️ *Cargo:* ${userRole}

📊 *ESTATÍSTICAS:*
🐮 *Gado:* ${gadoPercent}%
🎱 *Passiva:* ${passivaPercent}%
✨ *Beleza:* ${beleza}%
💸 *Preço:* R$ ${programPrice}
📰 *Fofoca:* ${fofocaLevel}%
📱 *Online:* ${onlineHrs}h/dia
😴 *Sono:* ${sono}%
😄 *Humor:* ${humor}

📝 *Frase do dia:* ${frase}`;

      await sendSuccessReact();
      await socket.sendMessage(remoteJid, {
        image: { url: profilePicUrl },
        caption: mensagem,
        mentions: [targetLid],
      });
    } catch (error) {
      console.error(error);
      sendErrorReply("❌ Ocorreu um erro ao verificar o perfil.");
    }
  },
};