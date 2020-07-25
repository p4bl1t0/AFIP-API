// Estos objetos deberian inyectarse
var oServicioDeFacturacion = {};
var objAuthRequest = {};

function CompUltimoAutorizado(/*int*/ ptovta, /*int*/ cbtTipo) {
    var objResponseTipo = oServicioDeFacturacion.FECompUltimoAutorizado(objAuthRequest, ptovta, cbtTipo);
    return objResponseTipo.CbteNro;
}

function GetCotizacionMoneda(/* string */ id) {
    var objResponseTipo = oServicioDeFacturacion.FEParamGetCotizacion(objAuthRequest, id);
    return objResponseTipo.ResultGet.MonCotiz;
}


// int ptoVta, int cbteTipo, int nro, int concepto , int docTipo , string docNro , string fecha
var ptoVta = 1;
var cbteTipo = 11; //Factura C
var nro = 1;
var concepto = 1;
var docTipo = 96;
var docNro = "33069425";
var fecha = "20180725";
// ------------------

var objCAE = {}; //new FECAERequest();
objCAE.FeCabReq = {}; //new FECAECabRequest();
objCAE.FeCabReq.CantReg = 1; // Cantidad de registros que se envian
objCAE.FeCabReq.CbteTipo = cbteTipo; // viene del maestro
objCAE.FeCabReq.PtoVta = ptoVta; // deberia seleccionarlo el usuario de los cargados / configurados

objCAE.FeDetReq = [];
objCAE.FeDetReq[0] = {
	FECAEDetRequest: {}
}; // new FECAEDetRequest()

objCAE.FeDetReq[0].FECAEDetRequest.Concepto = concepto; // 1 Productos | 2 Servicios | 3 Productos y Servicios
objCAE.FeDetReq[0].FECAEDetRequest.MonCotiz = 1; // Movimiento en pesos
objCAE.FeDetReq[0].FECAEDetRequest.MonId = "PES";  //  Por el momento el tipo de moneda queda fijo
objCAE.FeDetReq[0].FECAEDetRequest.DocTipo = docTipo; // Debería venir del maestro de precios
var trimmed = docNro.replace(/\-/g, "").replace(/\./g, "");
objCAE.FeDetReq[0].FECAEDetRequest.DocNro = parseFloat(trimmed);

if (concepto >= 2) {
	// Automaticamente pongo el mes anterior a facturar. SIno hay que seleccionar uno por COBOL
	// [TODO]: To Javascript
    /* fact_date = new DateTime(ano, mes, DateTime.DaysInMonth(ano, mes));                        
    objCAE.FeDetReq[0].FchVtoPago = fact_date.ToString("yyyyMMdd");

    fact_date = fact_date.AddMonths(-1);
    last_day = DateTime.DaysInMonth(fact_date.Year, fact_date.Month);

    objCAE.FeDetReq[0].FchServDesde = fact_date.ToString("yyyyMM") + "01";
    objCAE.FeDetReq[0].FchServHasta = fact_date.ToString("yyyyMM") + (last_day < 10 ? "0" : "") + last_day.ToString();*/                     
} else {
	objCAE.FeDetReq[0].FECAEDetRequest.FchVtoPago = null;
	objCAE.FeDetReq[0].FECAEDetRequest.FchServDesde = null;
	objCAE.FeDetReq[0].FECAEDetRequest.FchServHasta = null;
}

var tributoList = [];
function AgregarTributo(/*int*/ id, /*string*/ desc, /*double*/ base, /*double*/ porcentaje, /*double*/ monto) {
	var i = {};
	i.Id = id;
	i.Desc = desc;
	i.BaseImp = Math.round(base, 2);
	i.Importe = Math.round(monto, 2);
	i.Alic = Math.round(porcentaje, 2);
	tributoList.push(i);
}

var ivaList = [];
function AgregarIva(/* int */ ivaID, /* double */ valor, /* double */ monto) {
	var i = {};
	i.BaseImp = Math.round(valor, 2);
	i.Importe = Math.round(monto, 2);
	i.Id = ivaID;
	var obj = {
		AlicIva: i //new AlicIva();
	}
	ivaList.push(obj);
}

var cbteList = [];
function AgregarComprobanteRelacionado (/* int */ cbteTipo, /* int */ ptoVta, /* int */ nro) {
	var i = {}; //new CbteAsoc();
	i.Tipo = cbteTipo;
	i.PtoVta = ptoVta;
	i.Nro = nro;
	cbteList.push(i);
}


function FechaServicio (/* string */ desde, /* string */ hasta, /* string */ vencimiento) {
    objCAE.FeDetReq[0].FECAEDetRequest.FchVtoPago = vencimiento; // yyyyMMdd
    objCAE.FeDetReq[0].FECAEDetRequest.FchServDesde = desde;
    objCAE.FeDetReq[0].FECAEDetRequest.FchServHasta = hasta;
}

function CambiarMoneda (/* string */ moneda, /* double */ coitzacion) {
    objCAE.FeDetReq[0].FECAEDetRequest.MonCotiz = coitzacion;
    objCAE.FeDetReq[0].FECAEDetRequest.MonId = moneda;  //  Por el momento el tipo de moneda queda fijo
}



// double total, double neto, double nogravado, double exento , double iva , double tributos
var total = 1000;
var neto = 1000;
var nogravado = 0;
var exento = 0;
var iva = 0;
var tributos = 0;

// ----------------------------------------

objCAE.FeDetReq[0].FECAEDetRequest.CbteFch = fecha;  // yyyyMMdd
if (nro === 0) {
	nro = CompUltimoAutorizado(ptoVta, cbteTipo) + 1;
}
objCAE.FeDetReq[0].FECAEDetRequest.CbteDesde = nro;
objCAE.FeDetReq[0].FECAEDetRequest.CbteHasta = nro;

objCAE.FeDetReq[0].FECAEDetRequest.ImpNeto = Math.round(neto, 2);
objCAE.FeDetReq[0].FECAEDetRequest.ImpIVA = Math.round(iva, 2);
objCAE.FeDetReq[0].FECAEDetRequest.ImpTotal = Math.round(total, 2);
objCAE.FeDetReq[0].FECAEDetRequest.ImpTotConc = Math.round(nogravado, 2);
objCAE.FeDetReq[0].FECAEDetRequest.ImpTrib = Math.round(tributos, 2);
objCAE.FeDetReq[0].FECAEDetRequest.ImpOpEx = Math.round(exento, 2); 

objCAE.FeDetReq[0].FECAEDetRequest.Iva = null;
if (ivaList.length > 0) {
    objCAE.FeDetReq[0].FECAEDetRequest.Iva = ivaList;
}
objCAE.FeDetReq[0].FECAEDetRequest.Tributos = null; 
if (tributoList.length > 0) {
    objCAE.FeDetReq[0].FECAEDetRequest.Tributos = tributoList;
}
objCAE.FeDetReq[0].FECAEDetRequest.CbtesAsoc = null; 
if (cbteList.Count > 0) {
    objCAE.FeDetReq[0].FECAEDetRequest.CbtesAsoc = cbteList; 
}

objCAE.FeDetReq[0].FECAEDetRequest.Opcionales = null; 
// objCAE.FeDetReq[0].FECAEDetRequest.Compradores = []; 
//var objResponse = oServicioDeFacturacion.FECAESolicitar(objAuthRequest, objCAE); 


var path = require('path');
	
global.keys = {
	private: path.join(__dirname, 'keys', 'afip.key'),
	public: path.join(__dirname, 'keys', 'afip.pem')
};

var afip = require('./afip');

var request = {
	auth: {
		key: 'Auth',
		token: 'Token',
		sign: 'Sign'
	},
	params: {
		FeCAEReq: objCAE,
		Auth: {
			Cuit: '20330694255'
		}
	}
};
afip.endpoint('wsfev1', 'FECAESolicitar', request);
