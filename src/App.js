import Lotto from "./Lotto.js";
import { input } from "./util/input.js";
import { print } from "./util/output.js";
import { PRINT_MESSAGE } from "./constants/message.js";

import { Random } from "@woowacourse/mission-utils";
import {
  getValidatedNumber,
  getValidatedNumbers,
} from "./validation/number.js";
import { validateMoney } from "./validation/money.js";
import { PRIZE } from "./constants/prize.js";
class App {
  lottos = [];

  getLottoCount(money) {
    
    return money / 1000;
  }

  async printBuyCount(count) {
    await print(`${count}${PRINT_MESSAGE.BUY_COUNT}`);
  }

  async createLottos(count) {
    for (let i = 0; i < count; i++) {
      this.insertLotto();
    }
  }

  async insertLotto() {
    const RANDOMS = await Random.pickUniqueNumbersInRange(1, 45, 6);
    const lotto = new Lotto(RANDOMS);
    this.lottos.push(lotto);
    return lotto;
  }

  makeNumberArray(numberString) {
    const numbers = numberString.split(",");
    return getValidatedNumbers(numbers);
  }

  getPrizeCounts(numbers, bonusNumber){
    let prizeCounts = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      bonus: 0,
      6: 0,
    };

    this.lottos.forEach((lotto) => {
      const { count, isbonus } = lotto.getPrizeCount(numbers, bonusNumber);
      if (isbonus) prizeCounts["bonus"]++;
      else prizeCounts[count]++;
    });

    return prizeCounts;
  }

  getRate(prizeCounts, money){
    let prize = 0;

    prize += prizeCounts[3] * PRIZE[3];
    prize += prizeCounts[4] * PRIZE[4];
    prize += prizeCounts[5] * PRIZE[5];
    prize += prizeCounts['bonus'] * PRIZE['bonus'];
    prize += prizeCounts[6] * PRIZE[6];

    const rate = (prize / money * 100).toFixed(2);
    return rate;
  }

  getResult(numbers, bonusNumber, money) {
    const prizeCounts = this.getPrizeCounts(numbers, bonusNumber);
    const rate = this.getRate(prizeCounts, money);
    return {prizeCounts, rate};
  }

  async printResult(result) {
    print("당첨통계");
    print("---");
    print(`3개 일치 (5,000원) - ${result.prizeCounts["3"]}개`);
    print(`4개 일치 (50,000원) - ${result.prizeCounts["4"]}개`);
    print(`5개 일치 (1,500,000원) - ${result.prizeCounts["5"]}개`);
    print(`5개 일치, 보너스 볼 일치 (30,000,000원) - ${result.prizeCounts["bonus"]}개`);
    print(`6개 일치 (2,000,000,000원) - ${result.prizeCounts["6"]}개`);
    print(`총 수익률은 ${result.rate}%입니다.`);
    print("---");
  }

  async getPrizeNumbers() {
    const inputNumbers = await input(PRINT_MESSAGE.NUMBERS);
    return this.makeNumberArray(inputNumbers);
  }

  async getBonusNumber() {
    const inputBonusNumber = await input(PRINT_MESSAGE.BONUS_NUMBER);
    return getValidatedNumber(inputBonusNumber);
  }

  async setLottos(money) {
    const lottoCount = this.getLottoCount(money);
    
    await this.printBuyCount(lottoCount);
    print("");

    await this.createLottos(lottoCount);
  }

  //TODO: 보너스 숫자 이전 6 숫자 중복 시 에러
  async play() {
    const inputMoney = await input(PRINT_MESSAGE.INPUT_MONEY);
    validateMoney(+inputMoney);

    //로또 생성
    await this.setLottos(+inputMoney);

    //당첨 로또 번호 생성
    const numbers = await this.getPrizeNumbers();
    
    //보너스 번호 생성
    const bonusNumber = await this.getBonusNumber();

    const result = this.getResult(numbers, bonusNumber, +inputMoney);
    this.printResult(result);
  }
}

export default App;
