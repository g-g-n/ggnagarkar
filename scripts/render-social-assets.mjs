import sharp from 'sharp';

// Render the vector sources directly: invalid XML must fail instead of becoming a browser-error screenshot.
for (const name of ['gg-logo-horizontal', 'gg-social-card']) {
  await sharp(`public/brand/${name}.svg`, { density: 144 })
    .resize(name === 'gg-social-card' ? 1200 : 1180, name === 'gg-social-card' ? 630 : 280)
    .flatten({ background: '#ffffff' })
    .png()
    .toFile(`public/brand/${name}.png`);
  console.log(`Rendered ${name}.png`);
}
