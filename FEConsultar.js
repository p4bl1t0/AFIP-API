var path = require('path');
	
global.keys = {
	private: path.join(__dirname, 'keys', 'afip.key'),
	public: path.join(__dirname, 'keys', 'cenaih2.pem')
};
global.files = {
    cache: '/Users/pablo/Develop/afip-cenaih.cache'
}

var Afip = require('./afip');
var afip = new Afip(true);

var request = {
	auth: {
		key: 'Auth',
		token: 'Token',
		sign: 'Sign'
	},
	params: {
		Auth: {
			Cuit: '30701472256'
		},
		FeCompConsReq: {
			CbteTipo: 15,
			CbteNro: 9,
			PtoVta: 4
		}
	}
};

// {"FEParamGetTiposMonedasResult":{"ResultGet":{"Moneda":[{"Id":"PES","Desc":"Pesos Argentinos","FchDesde":"20090403","FchHasta":"NULL"},{"Id":"DOL","Desc":"Dólar Estadounidense","FchDesde":"20090403","FchHasta":"NULL"},{"Id":"002","Desc":"Dólar Libre EEUU","FchDesde":"20090416","FchHasta":"NULL"},{"Id":"007","Desc":"Florines Holandeses","FchDesde":"20090403","FchHasta":"NULL"},{"Id":"010","Desc":"Pesos Mejicanos","FchDesde":"20090403","FchHasta":"NULL"},{"Id":"011","Desc":"Pesos Uruguayos","FchDesde":"20090403","FchHasta":"NULL"},{"Id":"014","Desc":"Coronas Danesas","FchDesde":"20090403","FchHasta":"NULL"},{"Id":"015","Desc":"Coronas Noruegas","FchDesde":"20090403","FchHasta":"NULL"},{"Id":"016","Desc":"Coronas Suecas","FchDesde":"20090403","FchHasta":"NULL"},{"Id":"018","Desc":"Dólar Canadiense","FchDesde":"20090403","FchHasta":"NULL"},{"Id":"019","Desc":"Yens","FchDesde":"20090403","FchHasta":"NULL"},{"Id":"021","Desc":"Libra Esterlina","FchDesde":"20090403","FchHasta":"NULL"},{"Id":"023","Desc":"Bolívar Venezolano","FchDesde":"20090403","FchHasta":"NULL"},{"Id":"024","Desc":"Corona Checa","FchDesde":"20090403","FchHasta":"NULL"},{"Id":"025","Desc":"Dinar Yugoslavo","FchDesde":"20090403","FchHasta":"NULL"},{"Id":"026","Desc":"Dólar Australiano","FchDesde":"20090403","FchHasta":"NULL"},{"Id":"027","Desc":"Dracma Griego","FchDesde":"20090403","FchHasta":"NULL"},{"Id":"028","Desc":"Florín (Antillas Holandesas)","FchDesde":"20090403","FchHasta":"NULL"},{"Id":"029","Desc":"Güaraní","FchDesde":"20090403","FchHasta":"NULL"},{"Id":"031","Desc":"Peso Boliviano","FchDesde":"20090403","FchHasta":"NULL"},{"Id":"032","Desc":"Peso Colombiano","FchDesde":"20090403","FchHasta":"NULL"},{"Id":"033","Desc":"Peso Chileno","FchDesde":"20090403","FchHasta":"NULL"},{"Id":"034","Desc":"Rand Sudafricano","FchDesde":"20090403","FchHasta":"NULL"},{"Id":"036","Desc":"Sucre Ecuatoriano","FchDesde":"20090403","FchHasta":"NULL"},{"Id":"051","Desc":"Dólar de Hong Kong","FchDesde":"20090403","FchHasta":"NULL"},{"Id":"052","Desc":"Dólar de Singapur","FchDesde":"20090403","FchHasta":"NULL"},{"Id":"053","Desc":"Dólar de Jamaica","FchDesde":"20090403","FchHasta":"NULL"},{"Id":"054","Desc":"Dólar de Taiwan","FchDesde":"20090403","FchHasta":"NULL"},{"Id":"055","Desc":"Quetzal Guatemalteco","FchDesde":"20090403","FchHasta":"NULL"},{"Id":"056","Desc":"Forint (Hungría)","FchDesde":"20090403","FchHasta":"NULL"},{"Id":"057","Desc":"Baht (Tailandia)","FchDesde":"20090403","FchHasta":"NULL"},{"Id":"059","Desc":"Dinar Kuwaiti","FchDesde":"20090403","FchHasta":"NULL"},{"Id":"012","Desc":"Real","FchDesde":"20090403","FchHasta":"NULL"},{"Id":"030","Desc":"Shekel (Israel)","FchDesde":"20090403","FchHasta":"NULL"},{"Id":"035","Desc":"Nuevo Sol Peruano","FchDesde":"20090403","FchHasta":"NULL"},{"Id":"060","Desc":"Euro","FchDesde":"20090403","FchHasta":"NULL"},{"Id":"040","Desc":"Lei Rumano","FchDesde":"20090415","FchHasta":"NULL"},{"Id":"042","Desc":"Peso Dominicano","FchDesde":"20090415","FchHasta":"NULL"},{"Id":"043","Desc":"Balboas Panameñas","FchDesde":"20090415","FchHasta":"NULL"},{"Id":"044","Desc":"Córdoba Nicaragüense","FchDesde":"20090415","FchHasta":"NULL"},{"Id":"045","Desc":"Dirham Marroquí","FchDesde":"20090415","FchHasta":"NULL"},{"Id":"046","Desc":"Libra Egipcia","FchDesde":"20090415","FchHasta":"NULL"},{"Id":"047","Desc":"Riyal Saudita","FchDesde":"20090415","FchHasta":"NULL"},{"Id":"061","Desc":"Zloty Polaco","FchDesde":"20090415","FchHasta":"NULL"},{"Id":"062","Desc":"Rupia Hindú","FchDesde":"20090415","FchHasta":"NULL"},{"Id":"063","Desc":"Lempira Hondureña","FchDesde":"20090415","FchHasta":"NULL"},{"Id":"064","Desc":"Yuan (Rep. Pop. China)","FchDesde":"20090415","FchHasta":"NULL"},{"Id":"009","Desc":"Franco Suizo","FchDesde":"20091110","FchHasta":"NULL"},{"Id":"041","Desc":"Derechos Especiales de Giro","FchDesde":"20100125","FchHasta":"NULL"},{"Id":"049","Desc":"Gramos de Oro Fino","FchDesde":"20100125"

afip.endpoint('wsfev1', 'FECompConsultar', request).then((result) => {
	console.log('result enpoint', JSON.stringify(result));
});
