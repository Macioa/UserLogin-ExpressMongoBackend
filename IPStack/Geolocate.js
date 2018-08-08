require('es6-promise').polyfill();
require('isomorphic-fetch');

const geolocateIP = async (ip) => {
    try {
        let response = await fetch(`http://api.ipstack.com/${ip}?access_key=${process.env.IPSTACKAPIKEY}`,
            {
                method:'GET'
            })
        let parsedresponse = await response.json();
        if (await parsedresponse.city&&parsedresponse.zip)
            return await {city: parsedresponse.city, state: parsedresponse.region_name, country: parsedresponse.country_name, zip: parseFloat(parsedresponse.zip)} 
        else return {}
        } catch (err) {console.error(err)}
    return {}
}

module.exports=geolocateIP;