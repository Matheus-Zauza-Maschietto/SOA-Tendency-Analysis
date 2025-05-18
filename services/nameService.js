class NameService{
    async fetchNameFrequency(name, startDecade, endDecade) {
        const url = `https://servicodados.ibge.gov.br/api/v2/censos/nomes/${name}`;

        try {
        const response = await fetch(url);
        const data = await response.json();

        if (!data || !data[0] || !data[0].res) {
            throw new Error("No data found for the provided name.");
        }
        
        

        const result = data[0].res.slice(1);
        const filtered = result.filter(item => {
            const periods = item.periodo.replace("[", "").replace("]").split(",")

            const decadeStart = parseInt(periods[0] ?? null);
            const decadeEnd = parseInt(periods[1] ?? null);

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