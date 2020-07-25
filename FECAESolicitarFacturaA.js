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
var cbteTipo = 1; //Factura A
var nro = 3;
var concepto = 1;
var docTipo = 80;
var docNro = "27321662728";
var fecha = "20180806";
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
	i.BaseImp = (base);
	i.Importe = (monto);
	i.Alic = (porcentaje);
	tributoList.push(i);
}
AgregarTributo(1, 'Mi tributo', 0, 0, 100);
var ivaList = [];
function AgregarIva(/* int */ ivaID, /* double */ valor, /* double */ monto) {
	var i = {};
	i.BaseImp = valor; //solo 2 decimales
	i.Importe = monto; // solo 2 decimales
	i.Id = ivaID;
	ivaList.push(i);
}
AgregarIva(4, 100, 10.50); // 4: 10,5
AgregarIva(5, 100, 21.00); // 5: 21

var cbteList = [];
function AgregarComprobanteRelacionado (/* int */ cbteTipo, /* int */ ptoVta, /* int */ nro) {
	var i = {}; //new CbteAsoc();
	i.Tipo = cbteTipo;
	i.PtoVta = ptoVta;
	i.Nro = nro;
	cbteList.push(i);
}
// remito 91
AgregarComprobanteRelacionado (91, 1, 12);


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
var total = 200 + 10.5 + 21 + 100;
var neto = 200;
var nogravado = 0;
var exento = 0;
var iva = 10.5 + 21;
var tributos = 100;

// ----------------------------------------

objCAE.FeDetReq[0].FECAEDetRequest.CbteFch = fecha;  // yyyyMMdd
if (nro === 0) {
	nro = CompUltimoAutorizado(ptoVta, cbteTipo) + 1;
}
objCAE.FeDetReq[0].FECAEDetRequest.CbteDesde = nro;
objCAE.FeDetReq[0].FECAEDetRequest.CbteHasta = nro;

objCAE.FeDetReq[0].FECAEDetRequest.ImpNeto = (neto);
objCAE.FeDetReq[0].FECAEDetRequest.ImpIVA = (iva);
objCAE.FeDetReq[0].FECAEDetRequest.ImpTotal = (total);
objCAE.FeDetReq[0].FECAEDetRequest.ImpTotConc = (nogravado);
objCAE.FeDetReq[0].FECAEDetRequest.ImpTrib = (tributos);
objCAE.FeDetReq[0].FECAEDetRequest.ImpOpEx = (exento); 

objCAE.FeDetReq[0].FECAEDetRequest.Iva = null;
if (ivaList.length > 0) {
    objCAE.FeDetReq[0].FECAEDetRequest.Iva = {
		AlicIva: ivaList
	};
}
objCAE.FeDetReq[0].FECAEDetRequest.Tributos = null; 
if (tributoList.length > 0) {
    objCAE.FeDetReq[0].FECAEDetRequest.Tributos = {
		Tributo: tributoList
	};
}
objCAE.FeDetReq[0].FECAEDetRequest.CbtesAsoc = null; 
if (cbteList.Count > 0) {
    objCAE.FeDetReq[0].FECAEDetRequest.CbtesAsoc = {
		CbteAsoc: cbteList
	};
}

objCAE.FeDetReq[0].FECAEDetRequest.Opcionales = null; 
// objCAE.FeDetReq[0].FECAEDetRequest.Compradores = []; 
//var objResponse = oServicioDeFacturacion.FECAESolicitar(objAuthRequest, objCAE); 


var path = require('path');
	
global.keys = {
	private: path.join(__dirname, 'keys', 'afip.key'),
	public: path.join(__dirname, 'keys', 'afip.pem')
};

var Afip = require('./afip');
var afip = new Afip(false);

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

afip.endpoint('wsfev1', 'FECAESolicitar', request).then((result) => {
	console.log(JSON.stringify(result));
});
