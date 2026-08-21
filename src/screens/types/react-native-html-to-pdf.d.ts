declare module 'react-native-html-to-pdf' {
  interface Options {
    html: string;
    fileName?: string;
    directory?: string;
    base64?: boolean;
    height?: number;
    width?: number;
  }

  interface ConvertResult {
    filePath?: string;
    base64?: string;
  }

  interface RNHTMLtoPDFStatic {
    convert(options: Options): Promise<ConvertResult>;
  }

  const RNHTMLtoPDF: RNHTMLtoPDFStatic;
  export default RNHTMLtoPDF;
}