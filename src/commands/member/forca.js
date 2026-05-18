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

import { PREFIX } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";

const palavras = [
  "ELEFANTE", "CACHORRO", "GIRASSOL", "PINGUIM", "GOLFINHO",
  "BORBOLETA", "TARTARUGA", "CANGURU", "ARANHA", "JACARE",
  "BANANA", "ABACAXI", "MORANGO", "LARANJA", "MELANCIA",
  "UVA", "MANGA", "ACEROLA", "JABUTICABA", "MARACUJA",
  "COMPUTADOR", "TELEFONE", "BICICLETA", "GUITARRA", "TESOURA",
  "LAMPADA", "CADERNO", "CANETA", "ESPELHO", "RELOGIO",
  "PRAIA", "FUTEBOL", "CARNAVAL", "SHOPPING", "BIBLIOTECA",
  "ESCOLA", "HOSPITAL", "CINEMA", "IGREJA", "RESTAURANTE",
  "PROFESSOR", "MEDICO", "BOMBEIRO", "POLICIAL", "ENGENHEIRO",
  "ADVOGADO", "DENTISTA", "JORNALISTA", "COZINHEIRO", "PINTOR",
  "WHATSAPP", "JAVASCRIPT", "INTERNET", "CELULAR", "YOUTUBE",
  "GOOGLE", "INSTAGRAM", "FACEBOOK", "ROBLOX", "TIKTOK",
  "CHOCOLATE", "PIZZA", "HAMBURGUER", "PASTEL", "SORVETE",
  "PIPOCA", "BOLACHA", "MACARRAO", "FEIJOADA", "CHURRASCO",
  "BASQUETE", "VOLEIBOL", "NATACAO", "TENIS", "CORRIDA",
  "CICLISMO", "SURFE", "SKATE", "BOXE", "JUDO",
  "ESTUDAR", "TRABALHAR", "DORMIR", "CANTAR", "DANCAR",
  "PULAR", "CORRER", "NADAR", "VOAR", "SONHAR",
  "ESTRELA", "FLORESTA", "MONTANHA", "VULCAO", "CACHOEIRA",
  "TEMPESTADE", "ARCOIRIS", "RELAMPAGO", "TSUNAMI", "TERREMOTO",
];

const DICAS = {
  "ELEFANTE": "Maior animal terrestre, tem tromba e presas",
  "CACHORRO": "Melhor amigo do homem, late e abana o rabo",
  "PINGUIM": "Ave que não voa, vive no gelo e usa smoking",
  "GOLFINHO": "Mamífero marinho inteligente que salta ondas",
  "BORBOLETA": "Inseto colorido que nasce da lagarta",
  "TARTARUGA": "Réptil com casco, anda devagar e vive muito",
  "CANGURU": "Animal da Austrália que pula e carrega filhote na bolsa",
  "ARANHA": "Tem 8 patas, faz teia e às vezes assusta",
  "JACARE": "Réptil grande que vive em rios, tem dentes afiados",
  "BANANA": "Fruta amarela que macaco adora",
  "ABACAXI": "Fruta com coroa, ácida e espinhosa por fora",
  "MORANGO": "Fruta vermelha pequena com pintinhas",
  "LARANJA": "Fruta cítrica que faz suco e tem vitamina C",
  "MELANCIA": "Fruta verde por fora, vermelha por dentro, enorme",
  "UVA": "Fruta pequena em cachos, vira vinho",
  "MANGA": "Fruta tropical amarela, doce e suculenta",
  "JABUTICABA": "Fruta brasileira que nasce no tronco da árvore",
  "MARACUJA": "Fruta azedinha que acalma, tem casca enrugada",
  "COMPUTADOR": "Máquina que usamos para programar e navegar",
  "TELEFONE": "Aparelho que usamos para ligar e mandar mensagem",
  "BICICLETA": "Veículo de duas rodas movido a pedal",
  "GUITARRA": "Instrumento de cordas que faz rock",
  "TESOURA": "Objeto cortante de duas lâminas",
  "LAMPADA": "Ilumina o ambiente quando acionada",
  "CADERNO": "Tem folhas, usamos para escrever",
  "CANETA": "Objeto que escreve com tinta",
  "ESPELHO": "Reflete nossa imagem",
  "RELOGIO": "Mostra as horas",
  "PRAIA": "Lugar com areia e mar, ótimo para relaxar",
  "FUTEBOL": "Esporte mais popular do Brasil",
  "CARNAVAL": "Festa brasileira com samba e desfiles",
  "SHOPPING": "Lugar com muitas lojas e praça de alimentação",
  "BIBLIOTECA": "Lugar silencioso cheio de livros",
  "ESCOLA": "Lugar onde se estuda",
  "HOSPITAL": "Lugar onde se cuida da saúde",
  "CINEMA": "Lugar com tela grande e pipoca",
  "IGREJA": "Lugar de oração e fé",
  "RESTAURANTE": "Lugar onde se faz refeições fora de casa",
  "PROFESSOR": "Profissional que ensina",
  "MEDICO": "Profissional que cuida da saúde",
  "BOMBEIRO": "Profissional que apaga incêndios",
  "POLICIAL": "Profissional que protege a lei",
  "ENGENHEIRO": "Profissional que projeta e constrói",
  "ADVOGADO": "Profissional que defende na justiça",
  "DENTISTA": "Profissional que cuida dos dentes",
  "JORNALISTA": "Profissional que reporta notícias",
  "COZINHEIRO": "Profissional que prepara alimentos",
  "PINTOR": "Profissional que pinta quadros ou paredes",
  "WHATSAPP": "Aplicativo de mensagens mais famoso",
  "JAVASCRIPT": "Linguagem de programação da web",
  "INTERNET": "Rede mundial de computadores",
  "CELULAR": "Dispositivo móvel de comunicação",
  "YOUTUBE": "Plataforma de vídeos mais famosa",
  "GOOGLE": "Maior site de buscas do mundo",
  "INSTAGRAM": "Rede social de fotos e vídeos",
  "FACEBOOK": "Rede social criada por Mark Zuckerberg",
  "ROBLOX": "Plataforma de jogos online muito popular",
  "TIKTOK": "Rede social de vídeos curtos e danças",
  "CHOCOLATE": "Doce marrom feito de cacau",
  "PIZZA": "Comida italiana redonda com queijo",
  "HAMBURGUER": "Sanduíche com carne, pão e queijo",
  "PASTEL": "Comida frita típica de feira",
  "SORVETE": "Sobremesa gelada e doce",
  "PIPOCA": "Comida estourada feita de milho",
  "BOLACHA": "Biscoito doce ou salgado",
  "MACARRAO": "Massa italiana com molho",
  "FEIJOADA": "Prato típico brasileiro com feijão preto",
  "CHURRASCO": "Carne assada na brasa",
  "BASQUETE": "Esporte com bola e cesta",
  "VOLEIBOL": "Esporte de rede e bola",
  "NATACAO": "Esporte aquático",
  "TENIS": "Esporte de raquete e bola amarela",
  "CORRIDA": "Esporte de velocidade com os pés",
  "CICLISMO": "Esporte com bicicleta",
  "SURFE": "Esporte nas ondas do mar",
  "SKATE": "Esporte com prancha e rodinhas",
  "BOXE": "Esporte de luta com luvas",
  "JUDO": "Arte marcial japonesa",
  "ESTUDAR": "Ação de aprender algo novo",
  "TRABALHAR": "Ação de exercer uma profissão",
  "DORMIR": "Ação de descansar à noite",
  "CANTAR": "Ação de emitir sons musicais",
  "DANCAR": "Ação de se mover ao ritmo da música",
  "PULAR": "Ação de saltar do chão",
  "CORRER": "Ação de se mover rápido com os pés",
  "NADAR": "Ação de se mover na água",
  "VOAR": "Ação de se deslocar pelo ar",
  "SONHAR": "Ação de imaginar enquanto dorme",
  "ESTRELA": "Astro que brilha no céu à noite",
  "FLORESTA": "Grande área coberta de árvores",
  "MONTANHA": "Elevação natural do terreno",
  "VULCAO": "Montanha que expele lava",
  "CACHOEIRA": "Queda d'água natural",
  "TEMPESTADE": "Fenômeno com chuva forte e trovões",
  "ARCOIRIS": "Fenômeno colorido no céu após a chuva",
  "RELAMPAGO": "Clarão no céu durante tempestade",
  "TSUNAMI": "Onda gigante causada por terremoto",
  "TERREMOTO": "Tremor de terra",
};

function getDica(palavra) {
  return DICAS[palavra] || `Palavra de ${palavra.length} letras...`;
}

const jogos = {};

export default {
  name: "forca",
  description: "Jogo da Forca com dicas.",
  commands: ["forca"],
  usage: `${PREFIX}forca iniciar\n${PREFIX}forca dica\n${PREFIX}forca l <letra>\n${PREFIX}forca chutar <palavra>`,

  handle: async ({
    args,
    remoteJid,
    userLid,
    socket,
    sendReply,
    sendErrorReply,
  }) => {
    try {
      // Verifica modo brincadeira
      if (isModoBrincadeiraAtivo(remoteJid)) {
        const groupMetadata = await socket.groupMetadata(remoteJid);
        const participant = groupMetadata.participants.find(p => p.id === userLid);
        const isAdmin = participant?.admin === "admin" || participant?.admin === "superadmin";
        if (!isAdmin) {
          return sendReply("🎮 Apenas ADMINS podem usar este comando!");
        }
      }

      const action = args[0]?.toLowerCase();
      const gameKey = remoteJid;

      if (!action || action === "status") {
        const jogo = jogos[gameKey];
        if (!jogo) return sendReply("Nenhum jogo em andamento! Use `" + PREFIX + "forca iniciar`.");
        return sendReply(formatarForca(jogo));
      }

      if (action === "iniciar" || action === "novo") {
        const palavra = palavras[Math.floor(Math.random() * palavras.length)];
        jogos[gameKey] = {
          palavra,
          dica: getDica(palavra),
          letrasUsadas: [],
          erros: 0,
          maxErros: 6,
          ativo: true,
          dicasUsadas: 0,
        };
        return sendReply("🎮 *Jogo da Forca*\n\n" + formatarForca(jogos[gameKey]));
      }

      if (action === "dica" || action === "hint") {
        const jogo = jogos[gameKey];
        if (!jogo) return sendReply("Use `" + PREFIX + "forca iniciar` primeiro!");
        if (!jogo.ativo) return sendReply("Jogo já acabou!");
        if (jogo.dicasUsadas >= 3) return sendReply("❌ Você já usou todas as dicas!");

        jogo.dicasUsadas++;
        const naoDescobertas = jogo.palavra.split("").filter(l => !jogo.letrasUsadas.includes(l));
        if (naoDescobertas.length === 0) return sendReply("Tente chutar a palavra!");

        const letraRevelada = naoDescobertas[Math.floor(Math.random() * naoDescobertas.length)];
        jogo.letrasUsadas.push(letraRevelada);

        const acertouTodas = jogo.palavra.split("").every(l => jogo.letrasUsadas.includes(l));
        if (acertouTodas) { jogo.ativo = false; return sendReply(`🎉 *PARABÉNS!*\n\n${formatarForca(jogo)}\n\nPalavra: *${jogo.palavra}* 🏆`); }

        return sendReply(`💡 *DICA (${jogo.dicasUsadas}/3)*\n🔍 Letra: *${letraRevelada}*\n📝 ${jogo.dica}\n\n${formatarForca(jogo)}`);
      }

      if (action === "letra" || action === "l") {
        const jogo = jogos[gameKey];
        if (!jogo) return sendReply("Use `" + PREFIX + "forca iniciar` primeiro!");
        if (!jogo.ativo) return sendReply("Jogo já acabou!");

        const letra = args[1]?.toUpperCase();
        if (!letra || letra.length !== 1) throw new InvalidParameterError("Digite UMA letra!");

        if (jogo.letrasUsadas.includes(letra)) return sendReply("❌ Letra já usada!");
        jogo.letrasUsadas.push(letra);

        if (!jogo.palavra.includes(letra)) {
          jogo.erros++;
          if (jogo.erros >= jogo.maxErros) { jogo.ativo = false; return sendReply(`💀 *PERDEU!*\n${formatarForca(jogo)}\nPalavra: *${jogo.palavra}*`); }
          return sendReply(`❌ "${letra}" não encontrada!\n${formatarForca(jogo)}`);
        }

        const acertouTodas = jogo.palavra.split("").every(l => jogo.letrasUsadas.includes(l));
        if (acertouTodas) { jogo.ativo = false; return sendReply(`🎉 *PARABÉNS!*\n${formatarForca(jogo)}\nPalavra: *${jogo.palavra}* 🏆`); }
        return sendReply(`✅ "${letra}" encontrada!\n${formatarForca(jogo)}`);
      }

      if (action === "chutar" || action === "chute") {
        const jogo = jogos[gameKey];
        if (!jogo) return sendReply("Use `" + PREFIX + "forca iniciar` primeiro!");
        const chute = args.slice(1).join("").toUpperCase();
        if (!chute) throw new InvalidParameterError("Digite uma palavra!");
        if (chute === jogo.palavra) { jogo.ativo = false; return sendReply(`🎉 *PARABÉNS!*\nPalavra: *${jogo.palavra}* 🏆`); }
        jogo.erros = jogo.maxErros; jogo.ativo = false;
        return sendReply(`💀 *ERROU!*\nPalavra era: *${jogo.palavra}*`);
      }
    } catch (error) {
      await sendErrorReply(`${error.message}`);
    }
  },
};

function formatarForca(jogo) {
  const boneco = ["  😊","  😟\n  O","  😰\n  O\n  |","  😨\n  O\n /|","  😱\n  O\n /|\\","  💀\n  O\n /|\\\n /","  💀\n  O\n /|\\\n / \\"];
  const palavraEscondida = jogo.palavra.split("").map(l => jogo.letrasUsadas.includes(l) ? l : "_").join(" ");
  return `${boneco[Math.min(jogo.erros, 6)]}\n\n📝 ${palavraEscondida}\n\n💡 ${jogo.dica}\n🔤 Letras: ${jogo.letrasUsadas.join(" ") || "Nenhuma"}\n❌ Erros: ${jogo.erros}/${jogo.maxErros} | 💡 Dicas: ${jogo.dicasUsadas}/3`;
}