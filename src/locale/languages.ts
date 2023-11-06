export type LocalazyLanguage = {
    language: string;
    region: string;
    script: string;
    isRtl: boolean;
    localizedName: string;
    name: string;
    pluralType: (n: number) => "zero" | "one" | "two" | "many" | "few" | "other";
};
export type LocalazyFile = {
    cdnHash: string;
    file: string;
    path: string;
    library: string;
    module: string;
    buildType: string;
    productFlavors: string[];
    cdnFiles: { [lang:string]: string };
};
export type LocalazyMetadata = {
    projectUrl: string;
    baseLocale: string;
    languages: LocalazyLanguage[];
    files: LocalazyFile[];
};
     
const localazyMetadata: LocalazyMetadata = {
  projectUrl: "https://localazy.com/p/privacy-periscope",
  baseLocale: "en",
  languages: [
    {
      language: "de",
      region: "",
      script: "",
      isRtl: false,
      name: "German",
      localizedName: "Deutsch",
      pluralType: (n) => { return (n===1) ? "one" : "other"; }
    },
    {
      language: "en",
      region: "",
      script: "",
      isRtl: false,
      name: "English",
      localizedName: "English",
      pluralType: (n) => { return (n===1) ? "one" : "other"; }
    }
  ],
  files: [
    {
      cdnHash: "4d080a97d015e1ba7075b5366c46d0dab580e709",
      file: "messages.xlf",
      path: "",
      library: "",
      module: "",
      buildType: "",
      productFlavors: [],
      cdnFiles: {
        "de": "https://delivery.localazy.com/_a7593317844002959406e70bddc5/_e0/4d080a97d015e1ba7075b5366c46d0dab580e709/de/messages.xlf",
        "en": "https://delivery.localazy.com/_a7593317844002959406e70bddc5/_e0/4d080a97d015e1ba7075b5366c46d0dab580e709/en/messages.xlf"
      }
    }
  ]
};

export default localazyMetadata;