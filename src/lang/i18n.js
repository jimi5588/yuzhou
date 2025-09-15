import { createI18n } from "vue-i18n";
import en from "./en";
import zh from "./zh";
import ja from "./ja";
import ko from "./ko";
import es from "./es";
import de from "./de";
import fr from "./fr";
import vi from "./vi";

const i18n = createI18n({
    locale:localStorage.getItem('language') || 'en', // 默认是中文
    globalInjection:true,//全局配置$t
    legacy:false,
    messages:{zh,en,ja,ko,es,fr,de,vi}// 需要做国际化的语种
})

export default i18n