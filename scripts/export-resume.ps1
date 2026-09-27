param(
  [string]$OutputPath = (Join-Path $PSScriptRoot '..\assets\Sagar-Jayswal-Automation-Resume.pdf')
)

$resumeHtml = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\resume.html'))
$resolvedOutput = [IO.Path]::GetFullPath($OutputPath)
$edgeCandidates = @(
  'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
  'C:\Program Files\Microsoft\Edge\Application\msedge.exe'
)
$edge = $edgeCandidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1

if (-not $edge) {
  throw 'Microsoft Edge was not found. Install Edge or print resume.html to PDF manually.'
}

$outputDirectory = Split-Path -Parent $resolvedOutput
if (-not (Test-Path -LiteralPath $outputDirectory)) {
  New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null
}

$profileDirectory = Join-Path $env:TEMP ('sagar-resume-export-' + [Guid]::NewGuid().ToString('N'))
$exportPath = Join-Path $outputDirectory ('sagar-resume-export-' + [Guid]::NewGuid().ToString('N') + '.pdf')
New-Item -ItemType Directory -Path $profileDirectory | Out-Null

try {
  $resumeUri = [Uri]::new($resumeHtml).AbsoluteUri
  $arguments = @(
    '--headless=new',
    '--disable-gpu',
    '--disable-software-rasterizer',
    '--no-first-run',
    '--allow-file-access-from-files',
    '--no-pdf-header-footer',
    "--user-data-dir=$profileDirectory",
    "--print-to-pdf=$exportPath",
    $resumeUri
  )

  & $edge @arguments | Out-Null
  for ($attempt = 0; $attempt -lt 120 -and -not (Test-Path -LiteralPath $exportPath); $attempt++) {
    Start-Sleep -Milliseconds 250
  }

  if (-not (Test-Path -LiteralPath $exportPath)) {
    throw "Resume PDF was not created at $exportPath"
  }

  Move-Item -LiteralPath $exportPath -Destination $resolvedOutput -Force
  Get-Item -LiteralPath $resolvedOutput | Select-Object FullName, Length, LastWriteTime
}
finally {
  if (Test-Path -LiteralPath $exportPath) {
    Remove-Item -LiteralPath $exportPath -Force -ErrorAction SilentlyContinue
  }
  if (Test-Path -LiteralPath $profileDirectory) {
    $resolvedProfile = (Resolve-Path -LiteralPath $profileDirectory).Path
    $resolvedTemp = [IO.Path]::GetFullPath($env:TEMP)
    if ($resolvedProfile.StartsWith($resolvedTemp + [IO.Path]::DirectorySeparatorChar)) {
      Remove-Item -LiteralPath $resolvedProfile -Recurse -Force -ErrorAction SilentlyContinue
    }
  }
}
