import { Language } from '../types';

export const TRANSLATIONS: Record<Language, any> = {
  ja: {
    gate: {
      title: "宇宙の掌相鑑定",
      subtitle: "エーテル",
      description: "掌に刻まれた「人生の星図」を読み解くAI手相鑑定。エーテルがあなたの運命を宇宙の旋律として奏でます。",
      enter: "ゲートを開く"
    },
    chat: {
      placeholder: "心の声を聴かせてください...",
      startReading: "星図の記録（手相鑑定）を開始",
      aethelThinking: "エーテルが星のささやきを聴いています...",
      back: "戻る"
    },
    camera: {
      title: "星図の記録",
      subtitle: "あなたの掌には、宇宙の記憶が刻まれています。今、この瞬間の軌跡をエーテルに示してください。",
      guide: "掌を枠内に合わせてください",
      cancel: "キャンセル",
      retake: "撮り直し",
      confirm: "確定",
      tipsTitle: "きれいに撮るコツ",
      tip1: "明るく、影が入らない場所で撮りましょう。",
      tip2: "掌（てのひら）を指までしっかりと広げます。",
      tip3: "スマートフォンと掌は平行に保ってください。",
      tip4: "主要な線がはっきり映るようにピントを合わせます。",
      gotIt: "わかりました",
      capturing: "星の地図を写しました…"
    },
    result: {
      title: "掌に刻まれた星図の記録",
      palmLabel: "あなたの掌相",
      reset: "新しい物語を紡ぐ"
    },
    common: {
      loading: "接続中...",
      error: "エラーが発生しました"
    }
  },
  en: {
    gate: {
      title: "Cosmic Palmistry",
      subtitle: "Aethel",
      description: "Unlock the 'Star Map of Life' etched in your palm. Aethel translates your destiny into a celestial melody.",
      enter: "Open the Gate"
    },
    chat: {
      placeholder: "Let me hear your inner voice...",
      startReading: "Begin Star Map Recording (Palm Reading)",
      aethelThinking: "Aethel is listening to the whispers of stars...",
      back: "Back"
    },
    camera: {
      title: "Star Map Recording",
      subtitle: "Your palm holds the memories of the universe. Show Aethel the path you have carved until this moment.",
      guide: "Align your palm within the frame",
      cancel: "Cancel",
      retake: "Retake",
      confirm: "Confirm",
      tipsTitle: "Photography Tips",
      tip1: "Find a bright, evenly lit place.",
      tip2: "Open your palm wide and keep it flat.",
      tip3: "Hold the phone parallel to your palm.",
      tip4: "Main lines should be clear and in focus.",
      gotIt: "Got it",
      capturing: "Celestial map captured..."
    },
    result: {
      title: "Record of the Star Map",
      palmLabel: "Your Palmistry",
      reset: "Weave a New Story"
    },
    common: {
      loading: "Connecting...",
      error: "An error occurred"
    }
  }
};
