const btnPesquisarRanking = document.getElementById("btnPesquisarRanking");
const graficoRanking = document.getElementById("graficoRanking");

const selectUF = document.getElementById("uf");
const selectMunicipio = document.getElementById("municipio");
const btnPesquisarLocalidade = document.getElementById("btnPesquisarLocalidade");
const tabelaResultados = document.getElementById("tabelaResultadosMaisFrequenteEstado");

const btnCompararNomes = document.getElementById("btnCompararNomes");
const graficoComparacao = document.getElementById("graficoComparacao");

createOptinsUf();

async function createOptinsUf() {
    const ufs = await getUfs();

    ufs.forEach((uf) => {
        const option = document.createElement("option");
        option.value = uf.id;
        option.textContent = uf.nome + " - " + uf.sigla;
        selectUF.appendChild(option);
    });
}

async function getUfs() {
    const url = 'https://servicodados.ibge.gov.br/api/v1/localidades/estados';
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Erro: ${response.status}`);
        return await response.json();
    } catch (erro) {
        console.error('Erro ao consultar API:', erro.message);
        return null;
    }
}

async function getMunicipios(ufId) {
    const url = `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${ufId}/municipios`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Erro: ${response.status}`);
        return await response.json();
    } catch (erro) {
        console.error('Erro ao consultar API:', erro.message);
        return null;
    }
}

document.addEventListener("DOMContentLoaded", function() {


    if (btnPesquisarRanking) {
        btnPesquisarRanking.addEventListener("click", async function() {
            let graficoFrequenciaNome = Chart.getChart("graficoRanking");

            const nome = document.getElementById("nome").value;
            const anoInicio = document.getElementById("anoInicio").value;
            const anoFim = document.getElementById("anoFim").value;

            const nameService = new NameService();

            if(!!graficoFrequenciaNome) {
                graficoFrequenciaNome.destroy()
            }

            graficoFrequenciaNome = await criarGraficoFrequenciaNome(await nameService.fetchNameFrequency(nome, anoInicio, anoFim));
        });
    }

    if (selectUF) {
        selectUF.addEventListener("change", async function() {
            const ufSelecionada = this.value;

            if (!ufSelecionada) {
                selectMunicipio.innerHTML = '<option value="">Selecione primeiro um estado</option>';
                selectMunicipio.disabled = true;
                return;
            }

            selectMunicipio.disabled = false;

            const municipios = await getMunicipios(ufSelecionada) || [];


            selectMunicipio.innerHTML = "";


            const optionPadrao = document.createElement("option");
            optionPadrao.value = "";
            optionPadrao.textContent = "Selecione um município";
            selectMunicipio.appendChild(optionPadrao);


            municipios.forEach(function(municipio) {
                const option = document.createElement("option");
                option.value = municipio.id;
                option.textContent = municipio.nome;
                selectMunicipio.appendChild(option);
            });
        });
    }

    if (btnPesquisarLocalidade) {
        btnPesquisarLocalidade.addEventListener("click", () => getFrequenciaPorLocalidade());
    }

    if (btnCompararNomes) {
        btnCompararNomes.addEventListener("click", async function() {
            let graficoComparacaoNome = Chart.getChart("graficoComparacao");

            const nome1 = document.getElementById("nome1").value;
            const nome2 = document.getElementById("nome2").value;

            const nameComparisonService = new NameComparisonService();

            if(!!graficoComparacaoNome) {
                graficoComparacaoNome.destroy();
            }

            graficoComparacaoNome = await criarGraficoComparacaoNome(await nameComparisonService.compareNames(nome1, nome2));
        });
    }
});

async function getFrequenciaPorLocalidade() {
    if (!selectUF.value) {
        alert("Por favor, selecione um estado (UF).");
        return;
    }

    tabelaResultados.innerHTML = "";

    const locationsService= new LocationService();

    const response = await locationsService.fetchTopNamesByLocation(!!selectMunicipio.value ? selectMunicipio.value : selectUF.value);

    response.forEach(res => {
        const tr = document.createElement('tr');
        const tdDecada = document.createElement('td');
        const tdFrequente1 = document.createElement('td');
        const tdFrequente2 = document.createElement('td');
        const tdFrequente3 = document.createElement('td');

        tdFrequente1.innerHTML = (res?.names[0]?.name ?? "") + " - " + (res?.names[0]?.frequency ?? "");
        tdFrequente2.innerHTML = (res?.names[1]?.name ?? "") + " - " + (res?.names[1]?.frequency ?? "");
        tdFrequente3.innerHTML = (res?.names[2]?.name ?? "") + " - " + (res?.names[2]?.frequency ?? "");
        tdDecada.innerHTML = res.decade;

        tr.appendChild(tdDecada);
        tr.appendChild(tdFrequente1);
        tr.appendChild(tdFrequente2);
        tr.appendChild(tdFrequente3);

        tabelaResultados.appendChild(tr);
    });
}

async function criarGraficoFrequenciaNome(dados) {

    const ctx = graficoRanking.getContext("2d");

    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dados.map(d => d.periodo),
            datasets: [{
                label: 'Frequência',
                data: dados.map(d => d.frequencia),
                backgroundColor: 'rgba(54, 162, 235, 0.7)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                hoverBackgroundColor: 'rgba(75, 192, 192, 0.8)'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 20000
                    },
                    title: {
                        display: true,
                        text: 'Frequência'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Período'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Frequência: ${context.raw.toLocaleString()}`;
                        }
                    }
                }
            }
        }
    });
}

async function criarGraficoComparacaoNome(dados) {
    const ctx = graficoComparacao.getContext("2d");

    const periodos = dados.name1.evolution.map(p => p.periodo);

    const cores = ['#36A2EB', '#FF6384'];

    const datasets = Object.values(dados).map((nomeObj, index) => ({
        label: nomeObj.name,
        data: nomeObj.evolution.map(p => p.frequencia),
        borderColor: cores[index],
        fill: false,
        tension: 0.3
    }));

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: periodos,
            datasets: datasets
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Evolução de frequência por período'
                },
                tooltip: {
                    callbacks: {
                        label: ctx => ` ${ctx.dataset.label}: ${ctx.raw.toLocaleString()}`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Frequência'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Período'
                    }
                }
            }
        }
    });
}

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

class NameComparisonService {
    async compareNames(name1, name2) {
        const nameService = new NameService();

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