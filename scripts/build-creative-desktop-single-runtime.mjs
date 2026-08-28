import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(scriptDir, '..')
const creativePath = path.join(rootDir, 'creative-desktop.html')
const atomPath = path.join(rootDir, 'atom63-os.html')
const fragmentDir = path.join(rootDir, 'includes')
const fragmentPath = path.join(fragmentDir, 'creative-desktop-app-layer.html')
const wallpaperBundlePath = path.join(rootDir, 'assets', 'app-resume-BlE20C_z.js')
const mainBundlePath = path.join(rootDir, 'assets', 'index-BFexWVS5.js')

const read = file => readFile(file, 'utf8')

async function ensureAppLayerFragment() {
  try {
    return await read(fragmentPath)
  } catch {}

  const legacy = await read(creativePath)
  const iconStart = legacy.indexOf('        <div class="os-icons">')
  const iconEnd = legacy.indexOf('\n      </div>\n\n      <div class="os-dock-wrap">', iconStart)
  const modalStart = legacy.indexOf('      <div id="collectionModal"')
  const modalEnd = legacy.indexOf('\n    </section>\n  </div>\n  <script', modalStart)

  if ([iconStart, iconEnd, modalStart, modalEnd].some(index => index < 0)) {
    throw new Error('Unable to extract the eight-app layer from creative-desktop.html')
  }

  const icons = legacy.slice(iconStart, iconEnd).replace(/^ {8}/gm, '    ')
  const modals = legacy.slice(modalStart, modalEnd).replace(/^ {6}/gm, '    ')
  const fragment = `<div id="maridian-app-layer" class="os-root" aria-label="Maridian desktop applications">
  <section class="os-desktop" data-desktop>
${icons}

${modals}
  </section>
</div>
`

  await mkdir(fragmentDir, { recursive: true })
  await writeFile(fragmentPath, fragment)
  return fragment
}

async function buildSingleRuntimePage() {
  const atom = await read(atomPath)
  const appLayer = await ensureAppLayerFragment()
  const bodyIndex = atom.indexOf('<body>')
  if (bodyIndex < 0) throw new Error('atom63-os.html is missing its body element')

  const head = atom.slice(0, bodyIndex).replace(
    '</head>',
    `  <link rel="stylesheet" href="/css/creative-desktop-apps.css?v=6">
    <link rel="stylesheet" href="/css/creative-desktop-bridge.css?v=2">
  </head>`
  )

  const output = `${head}<body class="os-page creative-os63-page">
    <div id="root"></div>
${appLayer}
    <script src="/js/creative-desktop-apps.js?v=6"></script>
    <script src="/js/creative-desktop-bridge.js?v=2"></script>
  </body>
</html>
`

  await writeFile(creativePath, output)
}

async function trimWallpaperCatalog() {
  let bundle = await read(wallpaperBundlePath)
  const arrayStart = bundle.indexOf('zl=[')
  const arrayEnd = bundle.indexOf('];function Bl', arrayStart)
  if (arrayStart < 0 || arrayEnd < 0) throw new Error('Wallpaper catalog was not found in the OS63 bundle')

  const fullCatalog = bundle.slice(arrayStart, arrayEnd + 1)
  const floralStart = fullCatalog.indexOf('},{id:`floral-')
  if (floralStart < 0) {
    if (fullCatalog.includes('category:`floral`')) {
      throw new Error('Wallpaper catalog no longer has the expected category boundary')
    }
    if (!fullCatalog.endsWith('}]')) {
      bundle = `${bundle.slice(0, arrayEnd)}${fullCatalog.endsWith(']') ? '}]' : '}];'}${bundle.slice(arrayEnd + 1)}`
      await writeFile(wallpaperBundlePath, bundle)
    }
  } else {
    const abstractOnly = `${fullCatalog.slice(0, floralStart)}}]`
    bundle = `${bundle.slice(0, arrayStart)}${abstractOnly}${bundle.slice(arrayEnd + 1)}`
    bundle = bundle.replace(
      'wallpaperShuffle:{enabled:!0,mode:`interval`,intervalMinutes:.5}',
      'wallpaperShuffle:{enabled:!1,mode:`interval`,intervalMinutes:.5}'
    )
    bundle = bundle.replace('version:4,storage:', 'version:5,storage:')
    bundle = bundle.replace(
      'return n.osSystem=u(r)?r:d(void 0,n.uiTheme),n}}));',
      'return n.osSystem=u(r)?r:d(void 0,n.uiTheme),t<5&&(n.wallpaperShuffle={...(n.wallpaperShuffle||Gl.wallpaperShuffle),enabled:!1}),Hl(n.wallpaper)||(n.wallpaper=Gl.wallpaper),n}}));'
    )
    await writeFile(wallpaperBundlePath, bundle)
  }

  let mainBundle = await read(mainBundlePath)
  mainBundle = mainBundle
    .replaceAll('assets/app-resume-BlE20C_z.js?v=single-runtime-2"', 'assets/app-resume-BlE20C_z.js"')
    .replaceAll('from"./app-resume-BlE20C_z.js?v=single-runtime-2"', 'from"./app-resume-BlE20C_z.js"')
    .replaceAll('./app-resume-BlE20C_z.js?v=single-runtime-2`', './app-resume-BlE20C_z.js`')
  await writeFile(mainBundlePath, mainBundle)
}

await trimWallpaperCatalog()
await buildSingleRuntimePage()
