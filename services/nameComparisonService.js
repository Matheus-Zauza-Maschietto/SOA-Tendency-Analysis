import nameService from "./nameService";

class NameComparisonService {

  async compareNames(name1, name2) {
    const name1Evolution = await nameService.fetchNameFrequency(name1, 1930, new Date().getFullYear());
    const name2Evolution = await nameService.fetchNameFrequency(name2, 1930, new Date().getFullYear());
    return {
      name1: {
        name: name1,
        evolution: name1Evolution
      },
      name2: {
        name: name2,
        evolution: name2Evolution
      }
    }
  }
}

export default new NameComparisonService();