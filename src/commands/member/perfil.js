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
  "📱 Online 25h por dia",
  "🤡 Palhaço(a) oficial do grupo",
  "🦄 Unicórnio raro de se ver",
  "🪑 Já virou móvel do grupo",
  "🧊 Frio(a) como gelo da Antártida",
  "🦖 Jurassic Park de tanta idade",
  "🎤 Cantor(a) de chuveiro premiado",
  "🧹 Vassoura elétrica: voa nas fofocas",
  "🛸 Abduzido(a) pelos ETs do zap",
  "🎯 Alvo preferido dos memes",
  "🧃 Suco de maracujá zero efeito",
  "🚀 Foguete: só sobe na zoeira",
  "🎳 Strike na arte de sumir",
  "🪞 Espelho, espelho meu... sai fora",
  "🦟 Mosquito: aparece do nada e some",
  "🎪 Dono(a) do próprio circo",
  "📡 Antena parabólica de fofoca",
];

const APELIDOS = [
  "Zé Preguiça", "Maria Fofoca", "João Sem Braço", "Tonhão da Net",
  "Cleitin Ilumidado", "Xeroque Rolmes", "Mestre dos Magos", "Dona Encrenca",
  "Rei da Resenha", "Rainha do Zap", "Capitão Óbvio", "Professor Pardal",
  "Véi da Lancha", "Jão do Grau", "Creusa do Zap", "Marcinha Encrenca",
  "Tio do Pavê", "Primo Rico", "Zé Droguinha", "Mano Brown Fake",
  "Carlinhos Turbo", "Tieta do Grupo", "Bebê Rena", "Pastor do Zap",
  "Doutora Fofoca", "Senhor Incrível", "Barbie Fake", "Ken Encrencado",
  "Patricinha do Pó", "Chico Bento", "Mônica Dentuça", "Cebolinha Ceboso",
];

const SIGNOS = [
  "♈ Áries", "♉ Touro", "♊ Gêmeos", "♋ Câncer", "♌ Leão", "♍ Virgem",
  "♎ Libra", "♏ Escorpião", "♐ Sagitário", "♑ Capricórnio", "♒ Aquário", "♓ Peixes",
];

const HABILIDADES = [
  "Sumir por 3 dias e voltar como se nada",
  "Responder depois de 2 semanas",
  "Mandar áudio de 5 minutos",
  "Visualizar e não responder",
  "Fazer drama nível novela",
  "Comer e mandar foto da comida",
  "Dormir em call",
  "Flodar figurinha de bom dia",
  "Perguntar e sair correndo",
  "Cantar no áudio desafinado",
  "Mandar corrente do zap",
  "Criar fake news do grupo",
  "Ser cancelado toda semana",
  "Puxar assunto aleatório às 3h",
  "Nunca ler as regras",
  "Sempre pedir admin",
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

      let profilePicUrl = `${ASSETS_DIR}/images/default-user.png`;
      let userRole = "👤 Membro";

      try {
        const { profileImage } = await getProfileImageData(socket, targetLid);
        profilePicUrl = profileImage || `${ASSETS_DIR}/images/default-user.png`;
      } catch (error) {}

      const groupMetadata = await socket.groupMetadata(remoteJid);
      const participant = groupMetadata.participants.find(p => p.id === targetLid);
      
      if (participant?.admin === "superadmin") userRole = "👑 Dono(a)";
      else if (participant?.admin === "admin") userRole = "🛡️ Administrador(a)";

      const seed = targetLid.split("@")[0].split("").reduce((a, b) => a + parseInt(b || "0"), 0);
      
      const apelido = APELIDOS[seed % APELIDOS.length];
      const signo = SIGNOS[seed % SIGNOS.length];
      const habilidade = HABILIDADES[seed % HABILIDADES.length];
      const frase = FRASES[seed % FRASES.length];
      
      // Stats engraçadas
      const beleza = (seed * 17) % 101;
      const fofoca = (seed * 11) % 101;
      const gado = (seed * 7) % 101;
      const drama = (seed * 13) % 101;
      const vacilao = (seed * 23) % 101;
      const figurinha = (seed * 29) % 101;
      const sono = (seed * 19) % 101;
      const humor = ["😊 Feliz", "😤 Bravo(a)", "🤪 Doido(a)", "😴 Com sono", "🤔 Confuso(a)", "😈 Malvado(a)", "🤗 Carinhoso(a)", "😭 Chorando", "🥳 Festa"][seed % 9];

      const barra = (pct) => {
        const cheio = Math.floor(pct / 10);
        return "▓".repeat(cheio) + "░".repeat(10 - cheio);
      };

      const mensagem = `📋 *PERFIL COMPLETO*

👤 *Nome:* @${targetLid.split("@")[0]}
🏷️ *Vulgo:* ${apelido}
🎖️ *Cargo:* ${userRole}
🔮 *Signo:* ${signo}

📊 *ESTATÍSTICAS:*
✨ Beleza: ${barra(beleza)} ${beleza}%
📰 Fofoca: ${barra(fofoca)} ${fofoca}%
🐮 Gado: ${barra(gado)} ${gado}%
🎭 Drama: ${barra(drama)} ${drama}%
🤡 Vacilão: ${barra(vacilao)} ${vacilao}%
🫶 Figurinha: ${barra(figurinha)} ${figurinha}%
😴 Sono: ${barra(sono)} ${sono}%
😄 Humor: ${humor}

🎯 *Habilidade especial:* ${habilidade}

📝 ${frase}`;

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