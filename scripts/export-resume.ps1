param(
  [string]$OutputPath = (Join-Path $PSScriptRoot '..\assets\Sagar-Jayswal-Automation-Resume.pdf')
)

$wdFormatPDF = 17
$wdPaperA4 = 7
$wdAlignLeft = 0
$wdAlignCenter = 1
$orange = 873187
$dark = -16777216
$gray = 5592405

function Add-Paragraph {
  param(
    [Parameter(Mandatory)]$Document,
    [Parameter(Mandatory)][string]$Text,
    [double]$Size = 8.7,
    [bool]$Bold = $false,
    [int]$Color = $dark,
    [double]$Before = 0,
    [double]$After = 1.5,
    [int]$Alignment = $wdAlignLeft,
    [bool]$KeepWithNext = $false
  )
  $end = $Document.Content.End - 1
  $range = $Document.Range($end, $end)
  $paragraph = $Document.Paragraphs.Add($range)
  $paragraph.Range.InsertBefore($Text)
  $paragraph.Range.Font.Name = 'Arial'
  $paragraph.Range.Font.Size = $Size
  $paragraph.Range.Font.Bold = if ($Bold) { -1 } else { 0 }
  $paragraph.Range.Font.Color = $Color
  $paragraph.Alignment = $Alignment
  $paragraph.Format.SpaceBefore = $Before
  $paragraph.Format.SpaceAfter = $After
  $paragraph.Format.LineSpacingRule = 0
  $paragraph.Format.KeepWithNext = if ($KeepWithNext) { -1 } else { 0 }
  return $paragraph
}

function Add-SectionHeading {
  param([Parameter(Mandatory)]$Document, [Parameter(Mandatory)][string]$Text)
  $paragraph = Add-Paragraph -Document $Document -Text $Text.ToUpperInvariant() -Size 9.2 -Bold $true -Color $orange -Before 5 -After 2 -KeepWithNext $true
  $paragraph.Range.Font.Spacing = 1.2
}

function Add-Role {
  param(
    [Parameter(Mandatory)]$Document,
    [Parameter(Mandatory)][string]$Date,
    [Parameter(Mandatory)][string]$Title,
    [Parameter(Mandatory)][string]$Company,
    [Parameter(Mandatory)][string]$Detail
  )
  Add-Paragraph -Document $Document -Text "$Title  |  $Company  |  $Date" -Size 8.8 -Bold $true -Before 1 -After .5 -KeepWithNext $true | Out-Null
  Add-Paragraph -Document $Document -Text $Detail -Size 8.2 -Color $gray -After 1.7 | Out-Null
}

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0

try {
  $doc = $word.Documents.Add()
  $section = $doc.Sections.Item(1)
  $section.PageSetup.PaperSize = $wdPaperA4
  $section.PageSetup.TopMargin = 28
  $section.PageSetup.BottomMargin = 28
  $section.PageSetup.LeftMargin = 34
  $section.PageSetup.RightMargin = 34

  try { $doc.BuiltInDocumentProperties.Item('Title').Value = 'Sagar Jayswal — Automation & Controls Resume' } catch {}
  try { $doc.BuiltInDocumentProperties.Item('Author').Value = 'Sagar Jayswal' } catch {}
  try { $doc.BuiltInDocumentProperties.Item('Subject').Value = 'Automation and Controls Technician Resume' } catch {}

  Add-Paragraph -Document $doc -Text 'SAGAR JAYSWAL' -Size 23 -Bold $true -After 0 -KeepWithNext $true | Out-Null
  Add-Paragraph -Document $doc -Text 'AUTOMATION & CONTROLS TECHNICIAN' -Size 10.5 -Bold $true -Color $orange -After 2 -KeepWithNext $true | Out-Null
  Add-Paragraph -Document $doc -Text 'Scarborough, Ontario  •  sagarjayswal63@gmail.com  •  linkedin.com/in/sagar-jayswal' -Size 8.2 -Color $gray -After 5 | Out-Null

  Add-SectionHeading -Document $doc -Text 'Profile'
  Add-Paragraph -Document $doc -Text 'Automation technician with hands-on experience programming, commissioning and troubleshooting PLC-controlled equipment. Works across control panels, PLC/HMI logic, machine vision, robotics, pneumatics, industrial communication and production support, with a methodical focus on safe and maintainable solutions.' -Size 8.5 -After 2 | Out-Null

  Add-SectionHeading -Document $doc -Text 'Technical Skills'
  Add-Paragraph -Document $doc -Text 'PLC & HMI: Omron Sysmac Studio, CX-Programmer, Siemens TIA Portal, Allen-Bradley Studio 5000   •   Vision & Robotics: Keyence IV2/IV3, PLC interfacing, Wittmann robot teaching, EOAT' -Size 8.1 -After 1 | Out-Null
  Add-Paragraph -Document $doc -Text 'Field Systems: I/O verification, sensors, VFDs, servo drives, pneumatics, EtherNet/IP   •   Delivery: troubleshooting, commissioning, functional testing, production trials, customer acceptance and documentation' -Size 8.1 -After 2 | Out-Null

  Add-SectionHeading -Document $doc -Text 'Experience'
  Add-Role -Document $doc -Date 'Sep 2025 — Present' -Title 'Automation Technician' -Company 'Axiom Group Inc. · Aurora, ON' -Detail 'Troubleshoot injection-molding cells; modify Omron PLC logic, HMI parameters and sequences; work with Keyence vision, Wittmann robots and EOAT; support commissioning, I/O verification and production trials.'
  Add-Role -Document $doc -Date 'Sep 2022 — Aug 2023' -Title 'Application Engineer' -Company 'Viraj Electromech · India' -Detail 'Developed PLC programs and HMI screens; integrated PLCs, robots, vision, servo drives, VFDs and networks; supported startup, testing and customer acceptance.'
  Add-Role -Document $doc -Date 'Aug 2021 — Aug 2022' -Title 'Service Engineer' -Company 'Viraj Electromech · India' -Detail 'Diagnosed PLC machinery using software, schematics, multimeters and oscilloscopes; supported breakdowns, maintenance, commissioning and I/O checks.'
  Add-Role -Document $doc -Date 'Nov 2020 — Aug 2021' -Title 'Panel Assembler' -Company 'Viraj Electromech · India' -Detail 'Built and wired industrial control panels and completed wiring verification, electrical checks and functional testing.'

  Add-SectionHeading -Document $doc -Text 'Selected Work'
  Add-Paragraph -Document $doc -Text 'Multi-Camera Vision Inspection Upgrade' -Size 8.7 -Bold $true -After .5 -KeepWithNext $true | Out-Null
  Add-Paragraph -Document $doc -Text 'Reviewed PLC logic, created vision programs, updated inspection-result mapping and validated the end-to-end inspection workflow.' -Size 8.2 -Color $gray -After 1.5 | Out-Null
  Add-Paragraph -Document $doc -Text 'Automation Backup Manager' -Size 8.7 -Bold $true -After .5 -KeepWithNext $true | Out-Null
  Add-Paragraph -Document $doc -Text 'Built a traceable workflow for PLC, HMI, robot and vision backups with standardized naming, history, monthly coverage and SHA-256 verification.' -Size 8.2 -Color $gray -After 2 | Out-Null

  Add-SectionHeading -Document $doc -Text 'Education'
  Add-Paragraph -Document $doc -Text 'Advanced Diploma, Electro-Mechanical Engineering Technology: Automation and Robotics  |  Centennial College, Toronto  |  2024 — 2025' -Size 8.2 -Bold $true -After 1 | Out-Null
  Add-Paragraph -Document $doc -Text 'Bachelor of Electrical Engineering  |  Gujarat Technological University, India  |  2017 — 2020' -Size 8.2 -Bold $true -After 1 | Out-Null
  Add-Paragraph -Document $doc -Text 'Diploma in Electrical Engineering  |  Gujarat Technological University, India  |  2014 — 2017' -Size 8.2 -Bold $true -After 0 | Out-Null

  $resolvedOutput = [IO.Path]::GetFullPath($OutputPath)
  $doc.SaveAs([ref]$resolvedOutput, [ref]$wdFormatPDF)
  $doc.Close($false)
}
finally {
  $word.Quit()
}
