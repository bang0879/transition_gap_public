import { MultiOptionGrid } from "@/components/forms/MultiOptionGrid";
import { NumericSlider } from "@/components/forms/NumericSlider";
import { OptionGrid } from "@/components/forms/OptionGrid";
import { SpectrumSlider } from "@/components/forms/SpectrumSlider";

export function questionComponent(inputType: string) {
  switch (inputType) {
    case "multi_select":
      return MultiOptionGrid;
    case "slider_5":
    case "spectrum":
      return SpectrumSlider;
    case "slider_10":
    case "numeric":
      return NumericSlider;
    case "single_select":
    default:
      return OptionGrid;
  }
}
