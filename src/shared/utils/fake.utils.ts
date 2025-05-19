export class FakeUtils {
  public static getRandomData(data) {
    const randomIndex = Math.floor(Math.random() * data.length);
    return data[randomIndex];
  }

  public static currentDatePlusMinutes(minutes: number) {
    const currentDate = new Date();
    return new Date(currentDate.getTime() + minutes * 60000);
  }

  public static numberBetween(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  public static randomBoolean() {
    return Math.random() > 0.5;
  }
}
