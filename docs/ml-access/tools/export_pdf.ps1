param([Parameter(Mandatory=$true)][string]$LibreOfficePath)
$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '../../..')).Path
$docxPath = Join-Path $repoRoot 'REPORT_4.docx'
$profileDir = Join-Path ([IO.Path]::GetTempPath()) ('ml-access-lo-' + [Guid]::NewGuid().ToString('N'))
$profileUri = ([Uri]$profileDir).AbsoluteUri
$arguments = @(('-env:UserInstallation=' + $profileUri), '--headless', '--norestore', '--convert-to', 'pdf', '--outdir', ('"' + $repoRoot + '"'), ('"' + $docxPath + '"'))
$conversion = Start-Process -FilePath $LibreOfficePath -ArgumentList $arguments -WindowStyle Hidden -Wait -PassThru
if ($conversion.ExitCode -ne 0) { throw ('PDF export failed: ' + $conversion.ExitCode) }
Get-Item -LiteralPath (Join-Path $repoRoot 'REPORT_4.pdf') | Select-Object FullName, Length
