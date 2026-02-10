
const MEDIA_URL = 'https://media.api-sports.io/bookmakers';

async function checkLogoUrl() {
    try {
        console.log('Checking alternate logo URL pattern...');
        // 10Bet has ID 1 usually.
        const testId = 1;
        const url = `${MEDIA_URL}/${testId}.png`;
        console.log(`Testing URL: ${url}`);

        const res = await fetch(url);
        console.log(`Status: ${res.status}`);

        if (res.status === 200) {
            console.log('Success! Logo URL pattern is valid.');
        } else {
            console.log('Failed to fetch logo directly.');
        }

    } catch (e) {
        console.error(e);
    }
}

checkLogoUrl();
