param (
    [string] $Command
)

while ($null -eq $Command -or $Command -eq "") {
    # ask for a command input and halt the execution
    Write-Host "Enter a command to run:"
    Write-Host " - new-post"
    Write-Host " - new-images"
    Write-Host " - quit"
    $Command = Read-Host "Enter command to run"
}

if ($Command -eq "quit") {
    exit
}

if ($Command -eq "new-post") {
    # create new file in _posts with default content
    $date = Get-Date -Format "yyyy-MM-dd"
    $filename = "$date-new-post.md"
    $filepath = "_posts\$filename"
    $content = ""
    $content += "---`nlayout: post`n"
    $content += "title: `n"
    $content += "date: $date`n"
    $content += "tags: []"
    $content += "`n---`n"

    # store the file
    New-Item -Path $filepath -ItemType File -Force
    Set-Content -Path $filepath -Value $content
    # open the new file in vs code
    Code $filepath
}

if ($Command -eq "new-images") {
    # create new image folder for the current date in the folder images/current-year/current-date
    $date = Get-Date -Format "yyyyMMdd"
    $folder = "images\$((Get-Date).Year)\$date"
    $folderpath = $folder

    # create the folder
    New-Item -Path $folderpath -ItemType Directory -Force

    # open the new folder in vs code
    Code $folderpath
}