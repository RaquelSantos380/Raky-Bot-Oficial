import { PREFIX } from "../../config.js";

const animais = [
  { dica: "🐕 Tem 4 patas, late e é o melhor amigo do homem", resposta: "cachorro" },
  { dica: "🐈 Tem 7 vidas, mia e adora caçar ratos", resposta: "gato" },
  { dica: "🐘 É enorme, tem tromba e nunca esquece", resposta: "elefante" },
  { dica: "🦁 É o rei da selva, tem juba", resposta: "leao" },
  { dica: "🐧 Vive no gelo, não voa mas nada bem", resposta: "pinguim" },
  { dica: "🦒 Tem pescoço longo e manchas", resposta: "girafa" },
  { dica: "🐬 Vive no mar, é inteligente e salta ondas", resposta: "golfinho" },
  { dica: "🦘 Vive na Austrália, pula e tem bolsa", resposta: "canguru" },
  { dica: "🐍 Rasteja, não tem patas, troca de pele", resposta: "cobra" },
  { dica: "🦉 Voa à noite, tem olhos grandes, é sábia", resposta: "coruja" },
];

const jogos = {};

export default {
  name: "acerte-animal",
  description: "Jogo de adivinhar o animal pela dica.",
  commands: ["acerteanimal", "animal", "adivinhaanimal"],
  usage: `${PREFIX}animal\n${PREFIX}animal chutar | resposta`,

  handle: async ({ args, remoteJid, sendReply }) => {
    const action = args[0]?.toLowerCase();
    const gameKey = remoteJid;

    if (!action || action === "jogar" || action === "novo") {
      const animal = animais[Math.floor(Math.random() * animais.length)];
      jogos[gameKey] = { ...animal, ativo: true };
      return sendReply(`🐾 *Acerte o Animal!*\n\n${animal.dica}\n\nDigite: \`${PREFIX}animal chutar | resposta\``);
    }

    if (action === "chutar" || action === "chute") {
      const jogo = jogos[gameKey];
      if (!jogo) return sendReply("Nenhum jogo ativo! Use `" + PREFIX + "animal` para começar.");

      const chute = args.slice(1).join(" ").toLowerCase().trim();
      if (!chute) return sendReply("Digite um animal!\nEx: `" + PREFIX + "animal chutar cachorro`");

      if (chute === jogo.resposta) {
        delete jogos[gameKey];
        return sendReply(`🎉 *ACERTOU!*\n\nÉ o *${jogo.resposta}*! 🏆`);
      } else {
        return sendReply(`❌ *ERROU!* Tente novamente!\n\n${jogo.dica}`);
      }
    }

    return sendReply("Use: `" + PREFIX + "animal` para jogar!");
  },
};