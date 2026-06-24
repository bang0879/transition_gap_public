import { Font } from "@react-pdf/renderer";

let registered = false;

export function registerReportFonts() {
  if (registered) return;
  Font.register({
    family: "Pretendard",
    fonts: [
      { src: "/fonts/pretendard-400.woff", fontWeight: 400 },
      { src: "/fonts/pretendard-700.woff", fontWeight: 700 },
    ],
  });
  registered = true;
}
