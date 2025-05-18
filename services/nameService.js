class NameService{
    async fetchNameFrequency(name, startDecade, endDecade) {
        const url = `https://servicodados.ibge.gov.br/api/v2/censos/nomes/${name}`;

        try {
        const response = await fetch(url);
        const data = await response.json();

        if (!data || !data[0] || !data[0].res) {
            throw new Error("No data found for the provided name.");
        }

        const result = data[0].res;

        const filtered = result.filter(item => {
            const match = item.period.match(/\[(\d+),(\d+)\[/);
            if (!match) return false;

            const decadeStart = parseInt(match[1]);
            const decadeEnd = parseInt(match[2]);

            return decadeStart >= startDecade && decadeEnd <= endDecade;
        });

        return filtered;
        } catch (error) {
        console.error("Error fetching data from IBGE:", error);
        throw error;
        }
    }
}

export default new NameService();