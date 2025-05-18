class LocationService {
    async fetchTopNamesByLocation(locationCode) {
        const results = [];
        
        for (let decade = 1930; decade < new Date().getFullYear(); decade += 10) {
            try {
                const url = `https://servicodados.ibge.gov.br/api/v2/censos/nomes/ranking?localidade=${locationCode}&decada=${decade}`;
                const response = await fetch(url);
                const data = await response.json();

                if (!Array.isArray(data) || data.length === 0 || !data[0].res) {
                    continue;
                }

                const topThree = data[0].res.slice(0, 3);
                results.push({
                    decade,
                    names: topThree.map(item => ({
                        name: item.nome,
                        frequency: item.frequencia
                    }))
                });
            } catch (error) {
                console.error(`Error fetching data for decade ${decade}:`, error);
            }
        }

        return results;
    }

}

export default new LocationService();