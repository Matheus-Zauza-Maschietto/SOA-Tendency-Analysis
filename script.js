import locationsService from "./services/locationsService";
import nameService from "./services/nameService";
import nameComparisonServiceJs from "./services/nameComparisonService.js";

const btnPesquisarRanking = document.getElementById("btnPesquisarRanking");
const graficoRanking = document.getElementById("graficoRanking");

const selectUF = document.getElementById("uf");
const selectMunicipio = document.getElementById("municipio");
const btnPesquisarLocalidade = document.getElementById("btnPesquisarLocalidade");
const tabelaResultados = document.getElementById("tabelaResultados");

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
        btnPesquisarRanking.addEventListener("click", function() {
            const nome = document.getElementById("nome").value;
            const anoInicio = document.getElementById("anoInicio").value;
            const anoFim = document.getElementById("anoFim").value;

            if (!nome) {
                alert("Por favor, digite um nome para pesquisar.");
                return;
            }

            if (!anoInicio || !anoFim) {
                alert("Por favor, preencha o intervalo de anos.");
                return;
            }

            if (parseInt(anoInicio) > parseInt(anoFim)) {
                alert("O ano inicial deve ser menor que o ano final.");
                return;
            }

    
            graficoRanking.innerHTML = `
                <div style="text-align: center;">
                    <p style="font-weight: 500;">Dados do ranking para "${nome}" entre ${anoInicio} e ${anoFim}</p>
                    <p style="font-size: 14px; color: #777; margin-top: 10px;">Este é um espaço reservado para o gráfico que será implementado posteriormente.</p>
                </div>
            `;
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
        btnPesquisarLocalidade.addEventListener("click", function() {
            const ufSelecionada = selectUF.value;
            const municipioSelecionado = selectMunicipio.value;

            if (!ufSelecionada) {
                alert("Por favor, selecione um estado (UF).");
                return;
            }

            if (!municipioSelecionado) {
                alert("Por favor, selecione um município.");
                return;
            }
    
            const dadosSimulados = {
                nomesMaisFrequentes: ["Maria", "João", "Ana"],
                decadaMaisFrequente: "1980"
            };
    
            const linhas = tabelaResultados.getElementsByTagName("tr");
    
            for (let i = 0; i < 3; i++) {
                if (linhas[i] && dadosSimulados.nomesMaisFrequentes[i]) {
                    linhas[i].cells[1].textContent = dadosSimulados.nomesMaisFrequentes[i];
                }
            }
    
            if (linhas[3]) {
                linhas[3].cells[1].textContent = dadosSimulados.decadaMaisFrequente;
            }
        });
    }

    if (btnCompararNomes) {
        btnCompararNomes.addEventListener("click", function() {
            const nome1 = document.getElementById("nome1").value;
            const nome2 = document.getElementById("nome2").value;

            if (!nome1 || !nome2) {
                alert("Por favor, preencha os dois nomes para comparação.");
                return;
            }
    
            graficoComparacao.innerHTML = `
                <div style="text-align: center;">
                    <p style="font-weight: 500;">Comparação entre "${nome1}" e "${nome2}"</p>
                    <p style="font-size: 14px; color: #777; margin-top: 10px;">Este é um espaço reservado para o gráfico que será implementado posteriormente.</p>
                </div>
            `;
        });
    }
});