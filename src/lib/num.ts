export abstract class NumUtils {
  public static hasNumber(text: string): boolean {
    return /\d/.test(text);
  }

  public static hasOnlyNumbers(text: string): boolean {
    return /^\d+$/.test(text);
  }
}
