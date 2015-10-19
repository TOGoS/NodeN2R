class N2RAction {
	constructor( transformName : string, uri : string, filenameHint : ?string ) {
		this.transformName = transformName;
		this.uri           = uri;
		this.filenameHint  = filenameHint;
	}
};

function normalizeTransformName( name ) {
	if( name == 'N2R' ) return 'raw';
	return name;
}

export class Server {
	constructor( opts : object ) {
		console.log("Got here.");
	}
	
	parseReq( req ) {
		const qsi = req.originalUrl.lastIndexOf('?');
		const queryString = qsi == -1 ? "" : req.originalUrl.substring(qsi+1);
		
		if( req.path.startsWith("/uri-res/") ) {
			const subPath = req.path.substring("/uri-res/".length);
			const si = subPath.indexOf("/");
			if( si == -1 ) return new N2RAction( normalizeTransformName(subPath), queryString );
			const transformName = subPath.substring(0,si);
			const si2 = subPath.indexOf("/", si+1);
			const uri = si2 == -1 ? subPath.substring(si+1) : subPath.substring(si+1, si2);
			const filenameHint = si2 == -1 ? null : subPath.substring(si2+1);
			return new N2RAction( normalizeTransformName(transformName), uri, filenameHint);
		}
		return null;
	};
	
	doAction(act, req, res) {
		res.send("URI = "+act.uri+", filename = "+act.filenameHint+", transform = "+act.transformName);
	};
	
	get expressHandler() {
		return (req, res, next) => {
			const act = this.parseReq(req);
			if( act ) {
				this.doAction(act, req, res);
			} else {
				next();
			}
		}
	}
};
