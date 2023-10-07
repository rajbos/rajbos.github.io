param (
    [string] $Command
)

while ($null -eq $Command -or $Command -eq "") {
    # ask for a command input and halt the execution
    Write-Host "Enter a command to run:"
    Write-Host " - new-post"
    Write-Host " - new-images"
    Write-Host " - check-image-links"
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

if ($Command -eq "check-image-links") {
    # loop over all md files
    $files = Get-ChildItem -Path _posts -Filter *.md -Recurse
    $foundLinks = 0
    $notFoundLinks = 0
    $itemsOpened = 0
    foreach ($file in $files) {
        # get their content
        $content = Get-Content $file.FullName
        # check if the image links are valid
        # find the links that have the format ![alt text](/images/2020/20200101/image.png)
        $linkMatches = $content | Select-String -Pattern "!\[.*\]\(/images/.*\)"
        $foundLinks += $linkMatches.Count
        $location = Get-Location
        foreach ($match in $linkMatches) {
            # get everything between the parentheses
            $link = $match -replace ".*\((.*)\).*", '$1'
            if ($link.StartsWith("/images/")) {
                # it's a local link
                # check if the file exists in that path
                $windowsFileLink = $link -replace "%20", " "
                if (-not (Test-Path ".$windowsFileLink")) {
                    $fileLineAddress = "$($file.FullName):$($match.LineNumber)"
                    Write-Host "File link not found: [$link] in [$fileLineAddress]"
                    $notFoundLinks++

                    # split the string on slashes and see if the second item is a year
                    $linkParts = $link -split "/"
                    if ($linkParts[2] -match "^[0-9]{4}$") {
                        # it's a year, check if that is once more in the linkParts
                        if ($linkParts[4] -eq $linkParts[2]) {
                            # remove the second year from the linkParts
                            $linkParts = $linkParts[0..3] + $linkParts[5..($linkParts.Count - 1)]
                            # show the new link
                            Write-Host "New link: [$($linkParts -join "/")]"
                            if (-not (Test-Path ".$($linkParts -join "/")")) {
                                Write-Host "Double Year replacement failed"
                            }
                            else {
                                # the link is valid, replace it in the file
                                $content = $content -replace $link, ($linkParts -join "/")
                                Set-Content -Path $file.FullName -Value $content
                                # break out of the loop for this link
                                continue
                            }
                        }
                    }

                    if ($itemsOpened -lt 10) {
                        $itemsOpened++
                        # open up the first 10 items to fix
                        Code --reuse-window -g "$fileLineAddress"
                    }
                    else {
                        # can be used for testing
                        #break
                    }
                }
            }
        }
    }

    Write-Host "Checked [$($files.Count)] files and found [$foundLinks] links of which [$notFoundLinks] are broken"
}