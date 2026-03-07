export const initClientes = [
  {id:"0001",tipoPessoa:"PF",nome:"Maria Aparecida Silva",cpf:"123.456.789-00",rg:"12.345.678-9",estadoCivil:"Casada",profissao:"Professora",cep:"",endereco:"Rua das Flores, 123, Centro, Campinas/SP",telefone:"(19) 99123-4567",email:"maria@email.com",obs:"",admins:[]},
  {id:"0002",tipoPessoa:"PF",nome:"João Carlos Mendes",cpf:"987.654.321-00",rg:"98.765.432-1",estadoCivil:"Solteiro",profissao:"Engenheiro",cep:"",endereco:"Av. Brasil, 456, Jardim, Araras/SP",telefone:"(19) 98765-4321",email:"joao@email.com",obs:"",admins:[]},
  {id:"0423",tipoPessoa:"PJ",nome:"Empresa XYZ Ltda.",cpf:"12.345.678/0001-99",rg:"",estadoCivil:"",profissao:"",cep:"",endereco:"Rua Comercial, 789, Centro, São Paulo/SP",telefone:"(11) 3456-7890",email:"contato@xyz.com.br",obs:"",admins:[{nome:"Carlos Alberto Souza",cpf:"111.222.333-44",cargo:"Diretor Executivo"},{nome:"Fernanda Lima",cpf:"555.666.777-88",cargo:"Sócia Administradora"}]},
];

export const initAdv = [
  {id:"ADV001",nome:"Dr. André Ferreira",oab:"SP 123.456",email:"andre@escritorio.com",tel:"(11) 99000-0001",perfil:"Administrador",cor:"#4f8ef7",foto:null},
  {id:"ADV002",nome:"Dra. Paula Mendonça",oab:"SP 789.012",email:"paula@escritorio.com",tel:"(11) 99000-0002",perfil:"Advogado",cor:"#6c63ff",foto:null},
  {id:"ADV003",nome:"Dr. Lucas Rocha",oab:"SP 345.678",email:"lucas@escritorio.com",tel:"(11) 99000-0003",perfil:"Colaborador",cor:"#34d399",foto:null},
];

export const initProcessos = [
  {id:"0001-A",clienteId:"0001",parteContraria:{nome:"Seguradora Exemplo S.A.",cpfCnpj:"00.000.000/0001-00",advogado:"Dr. Fulano de Tal",tipo:"Ré"},nup:"1234567-89.2024.8.26.0114",tribunal:"TJSP – Tribunal de Justiça de São Paulo",comarca:"Campinas",vara:"1ª Vara Cível",classe:"Ação de Indenização",assunto:"Responsabilidade Civil",valor:"35000",status:"ativo",responsavel:"ADV001",tags:"urgente",obs:"",horasTrabalhadas:12,pedidosDeferidos:2,pedidosIndeferidos:1,sentencas:[],acordaos:[],agravos:[],docsProcessuais:[],probExito:75,valorCausa:35000},
  {id:"0002-A",clienteId:"0002",parteContraria:{nome:"",cpfCnpj:"",advogado:"",tipo:"Réu"},nup:"9876543-21.2025.8.26.0066",tribunal:"TJSP – Tribunal de Justiça de São Paulo",comarca:"Araras",vara:"Vara Única",classe:"Divórcio Litigioso",assunto:"Família",valor:"",status:"ativo",responsavel:"ADV002",tags:"",obs:"",horasTrabalhadas:8,pedidosDeferidos:1,pedidosIndeferidos:0,sentencas:[],acordaos:[],agravos:[],docsProcessuais:[],probExito:50,valorCausa:0},
  {id:"0423-A",clienteId:"0423",parteContraria:{nome:"Fulano da Silva",cpfCnpj:"000.111.222-33",advogado:"",tipo:"Réu"},nup:"1111111-11.2024.8.26.0100",tribunal:"TJSP – Tribunal de Justiça de São Paulo",comarca:"São Paulo",vara:"2ª Vara Empresarial",classe:"Execução de Título",assunto:"Direito Empresarial",valor:"120000",status:"ativo",responsavel:"ADV001",tags:"urgente",obs:"",horasTrabalhadas:20,pedidosDeferidos:3,pedidosIndeferidos:2,sentencas:[{data:"2025-11-01",tipo:"favoravel",obs:"Julgado procedente"}],acordaos:[],agravos:[{data:"2025-12-10",tipo:"provido",obs:""}],docsProcessuais:[],probExito:85,valorCausa:120000},
  {id:"0423-B",clienteId:"0423",parteContraria:{nome:"",cpfCnpj:"",advogado:"",tipo:"Réu"},nup:"2222222-22.2025.8.26.0100",tribunal:"TJSP – Tribunal de Justiça de São Paulo",comarca:"São Paulo",vara:"3ª Vara Cível",classe:"Ação Declaratória",assunto:"Contratos",valor:"50000",status:"suspenso",responsavel:"ADV002",tags:"",obs:"",horasTrabalhadas:5,pedidosDeferidos:0,pedidosIndeferidos:1,sentencas:[],acordaos:[],agravos:[],docsProcessuais:[],probExito:30,valorCausa:50000},
];

export const initAndamentos = [
  {id:1,processoId:"0001-A",data:"2025-03-01",descricao:"Petição inicial protocolada.",origem:"manual",relevancia:"prazo",usuario:"ADV001",horas:2,minutos:0,tipoPeca:"Petição Inicial"},
  {id:2,processoId:"0001-A",data:"2025-04-10",descricao:"Audiência de conciliação designada para 15/05.",origem:"manual",relevancia:"audiencia",usuario:"ADV002",horas:1,minutos:30,tipoPeca:""},
  {id:3,processoId:"0423-A",data:"2025-06-01",descricao:"Despacho – emenda à inicial.",origem:"manual",relevancia:"despacho",usuario:"ADV001",horas:3,minutos:0,tipoPeca:"Emenda à Inicial"},
];

export const initAgenda = [
  {id:1,tipo:"audiencia",titulo:"Audiência – 0001-A",data:"2026-03-15",hora:"14:00",local:"Fórum de Campinas",obs:"",processoId:"0001-A",responsavel:"ADV001"},
  {id:2,tipo:"prazo",titulo:"Prazo contestação – 0423-A",data:"2026-03-10",hora:"23:59",local:"",obs:"Prazo fatal",processoId:"0423-A",responsavel:"ADV001"},
  {id:3,tipo:"reuniao",titulo:"Reunião cliente João",data:"2026-03-08",hora:"10:00",local:"Escritório",obs:"",processoId:"",responsavel:"ADV002"},
  {id:4,tipo:"prazo",titulo:"Recurso – 0002-A",data:"2026-03-09",hora:"23:59",local:"",obs:"",processoId:"0002-A",responsavel:"ADV002"},
  {id:101,tipo:"prazo",titulo:"Prazo IMESC – Caso Bruno (1000486-76.2021.8.26.0698)",data:"2026-03-06",hora:"",local:"",obs:"Foro de Pirangi – Vara Única. Intimação DJE 15/01/2026.",processoId:"",responsavel:"ADV001",gcal:true},
  {id:108,tipo:"audiencia",titulo:"Audiência de Conciliação – Raphael (1017462-97.2025.8.26.0576)",data:"2026-03-17",hora:"16:00",local:"Virtual – Microsoft Teams",obs:"Foro SJRio Preto – 4ª Vara Família.",processoId:"",responsavel:"ADV001",gcal:true},
  {id:113,tipo:"audiencia",titulo:"Audiência Rafael – Maximillian (1027382-95.2025.8.26.0576)",data:"2026-03-24",hora:"09:15",local:"Virtual – Microsoft Teams",obs:"3ª Vara Família SJRio Preto.",processoId:"",responsavel:"ADV001",gcal:true},
  {id:114,tipo:"audiencia",titulo:"Audiência #0066 – Joelma – Pensão por Morte",data:"2026-03-24",hora:"16:00",local:"Juizado Especial Federal",obs:"INSS réu.",processoId:"",responsavel:"ADV001",gcal:true},
  {id:117,tipo:"financeiro",titulo:"#145-001 – Honorários (25x R$600)",data:"2026-04-05",hora:"",local:"",obs:"",processoId:"",responsavel:"ADV001",gcal:true},
  {id:119,tipo:"audiencia",titulo:"Audiência Andre (1001480-14.2023.8.26.0576)",data:"2026-04-14",hora:"16:00",local:"Virtual – Microsoft Teams",obs:"3ª Vara Cível SJRio Preto.",processoId:"",responsavel:"ADV001",gcal:true},
];

export const initContratos = [
  {id:"0001-A",clienteId:"0001",processoId:"0001-A",objeto:"Defesa em ação de indenização por responsabilidade civil",total:5000,entrada:1000,caixaEsc:10,rateios:[{advId:"ADV001",perc:60},{advId:"ADV002",perc:30}],parcelas:[
    {n:1,venc:"2026-02-10",valor:1000,status:"paga",dataPag:"2026-02-08",forma:"Pix",banco:"NuBank",conta:"Conta PJ",comp:"txid123"},
    {n:2,venc:"2026-03-10",valor:1000,status:"paga",dataPag:"2026-03-05",forma:"Pix",banco:"NuBank",conta:"Conta PJ",comp:"txid456"},
    {n:3,venc:"2026-04-10",valor:1000,status:"aberta",dataPag:"",forma:"",banco:"",conta:"",comp:""},
    {n:4,venc:"2026-05-10",valor:1000,status:"aberta",dataPag:"",forma:"",banco:"",conta:"",comp:""},
  ]},
  {id:"0423-A",clienteId:"0423",processoId:"0423-A",objeto:"Execução de título extrajudicial",total:12000,entrada:2000,caixaEsc:10,rateios:[{advId:"ADV001",perc:70},{advId:"ADV002",perc:20}],parcelas:[
    {n:1,venc:"2026-01-15",valor:2000,status:"paga",dataPag:"2026-01-14",forma:"Boleto",banco:"Efí",conta:"Conta Cobrança",comp:""},
    {n:2,venc:"2026-02-15",valor:2000,status:"atrasada",dataPag:"",forma:"",banco:"",conta:"",comp:""},
    {n:3,venc:"2026-03-15",valor:2000,status:"aberta",dataPag:"",forma:"",banco:"",conta:"",comp:""},
    {n:4,venc:"2026-04-15",valor:2000,status:"aberta",dataPag:"",forma:"",banco:"",conta:"",comp:""},
    {n:5,venc:"2026-05-15",valor:2000,status:"aberta",dataPag:"",forma:"",banco:"",conta:"",comp:""},
  ]},
];

export const initPecas = [
  {id:1,processoId:"0001-A",data:"2025-03-01",tipo:"Petição Inicial",advId:"ADV001",obs:""},
  {id:2,processoId:"0423-A",data:"2025-06-01",tipo:"Emenda à Inicial",advId:"ADV001",obs:""},
  {id:3,processoId:"0001-A",data:"2025-05-10",tipo:"Contestação",advId:"ADV002",obs:""},
];

export const initServicosAvulsos = [
  {id:1,clienteId:"0001",descricao:"Consulta jurídica",valor:350,data:"2026-02-20",forma:"Pix",banco:"NuBank",status:"paga",rateios:[{advId:"ADV001",perc:80}],caixaEsc:10},
  {id:2,clienteId:"0423",descricao:"Elaboração de contrato avulso",valor:800,data:"2026-03-01",forma:"Pix",banco:"Efí",status:"aberta",rateios:[{advId:"ADV002",perc:70}],caixaEsc:15},
];
