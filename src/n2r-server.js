import fs from "fs";
import regeneratorRuntime from "regenerator-runtime-only";

const base32Sha1Regex = /([A-Z2-7]{32})/;

function parseBase32Sha1( urn ) {
	const m = base32Sha1Regex.exec(urn);
	if( m ) {
		return m[1];
	}
	return null;
}

class Repository {
	constructor( rootDir : string ) {
		this.rootDir = rootDir;
	}
	
	/**
	 * Returns a promise to the file containing the specified data.
	 * The promise fails with an error if no such file is found.
	 */
	findFile( urn : string ) {
		const base32Sha1 = parseBase32Sha1(urn);
		return new Promise( (resolve, reject) => {
			if( base32Sha1 === null ) {
				reject("Malformed URN: "+urn);
				return;
			}
			
			fs.readdir(this.rootDir+"/data", (err, sectors) => {
				if( err ) {
					reject(err);
					return;
				}
				
				var c = 0;
				for( var s in sectors ) {
					const fn = this.rootDir+"/data/"+sectors[s]+"/"+base32Sha1.substring(0,2)+"/"+base32Sha1;
					fs.exists(fn, function(exists) {
						if( exists ) {
							resolve(fn);
						} else {
							if( ++c == sectors.length ) reject(base32Sha1 + " not found");
						}
					});
				}
			});
		});
	}
}

var repo = new Repository("/home/stevens/.ccouch");
async function go() {
	try {
		repo.findFile("asd");
	} catch( err ) {
		console.log("Error! "+err);
	}
}
//go().then(() => console.log("pood"));

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

function _guessMimeType(buf : Buffer) {
	/*
	if( buf.length >= 2 ) {
		
	}
	*/
};

function guessMimeType(file : string) {
	// Don't want to deal with this right now.
	return new Promise( (resolve,reject) => resolve('text/plain') );
	
	return new Promise( (resolve, reject) => fs.open(file, "r", (err, fd) => {
		if( err ) {
			reject("Error opening "+file+" for reading: "+err);
			return;
		}
		
		var bytesRead = 0;
		var buffer = 123; // blah blah blah
			//fd.on('data', (dat) => 
	}));
}

export class Server {
	constructor( opts : object ) {
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
	
	async doAction(act, req, res) {
		try {
			const file = await repo.findFile(act.uri);
			const type = await guessMimeType(file);
			res.contentType(type);
			res.sendFile(file);
		} catch( error ) {
			res.status(500).send("Whups.  "+error);
		}
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
