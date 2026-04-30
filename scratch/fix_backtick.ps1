$f = 'src/lib/prompts/generate.ts'
$bytes = [System.IO.File]::ReadAllBytes($f)
$text = [System.Text.Encoding]::UTF8.GetString($bytes)
# The bad sequence is: } \ backtick newline  (i.e., ASCII 125, 92, 96, 13, 10)
# The good sequence is: } backtick ; newline (i.e., ASCII 125, 96, 59, 13, 10)
$backtick = [char]96
$backslash = [char]92
$bad = '}' + $backslash + $backtick
$good = '}' + $backtick + ';'
$text2 = $text.Replace($bad, $good)
[System.IO.File]::WriteAllText($f, $text2, [System.Text.Encoding]::UTF8)
Write-Host "Replacement count: $(($text2.Length - $text.Length))"
(Get-Content $f)[578..584]
