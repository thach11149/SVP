const fs = require('fs');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function main() {
  const provinces = await fetch('https://provinces.open-api.vn/api/p/').then(res => res.json());
  let districts = [];
  let wards = [];

  for (const province of provinces) {
    const provinceDetail = await fetch(`https://provinces.open-api.vn/api/p/${province.code}?depth=2`).then(res => res.json());
    if (provinceDetail.districts) {
      for (const district of provinceDetail.districts) {
        districts.push({
          ...district,
          province_code: province.code
        });
        const districtDetail = await fetch(`https://provinces.open-api.vn/api/d/${district.code}?depth=2`).then(res => res.json());
        if (districtDetail.wards) {
          for (const ward of districtDetail.wards) {
            wards.push({
              ...ward,
              district_code: district.code,
              province_code: province.code
            });
          }
        }
      }
    }
    console.log(`Done: ${province.name}`);
  }

  fs.writeFileSync('provinces.json', JSON.stringify(provinces, null, 2), 'utf8');
  fs.writeFileSync('districts.json', JSON.stringify(districts, null, 2), 'utf8');
  fs.writeFileSync('wards.json', JSON.stringify(wards, null, 2), 'utf8');
  console.log('Export completed!');
}

main();