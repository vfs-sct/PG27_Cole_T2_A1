$(function () {
    let blockCounter = 0;
    function clearBlocks() {
        let editorWindow = document.querySelector("#editor")
        editorWindow.innerHTML = '';
    }

    function loadLevelList() {
        $.ajax({
            url: "http://localhost:3000/levels",
            method: "GET",
            success: function (levelIds) {
                const $levelList = $("#level-list");
                $levelList.empty();
                $levelList.append('<option value="">Select a Level</option>');
                levelIds.forEach(function (id) {
                    $levelList.append(`<option value="${id}">${id}</option>`)
                });
            },
            error: function(xhr, status, error) {
                console.error("Error fetching level list:", error);
            }
        });
    };

    function createBlock(type, css)
    {
        const blockId = `block-${blockCounter++}`;
        
        const block = $("<div></div>") // this would be for creating a div
            .addClass(`${type}`)
            .attr("id", blockId)
            .css(css)
            .appendTo("#editor");

        block.draggable({
            containment: "#editor",

            stop: function (event, ui) {
                // You can add stuff here :D
                //TODO: some sort of soft saving
            }
        });

        block.click(function (event) {
            event.stopPropagation();
        });
    
        block.contextmenu(function (event) {
            event.preventDefault();
            if(confirm("Delete this block?")) {
                $(this).remove();
            };
        });
    }

    $("#add-block").click( () => createBlock("block", 
        {
            top: 0,
            left: 0
        }));

    $("#clear-blocks").click ( () => {

        if(confirm("Are you sure you want to clear all blocks from the window?"))
        {
            clearBlocks()
        }
    });

    $("#load-level").click(() => {
        const $levelList = $("#level-list");
        const selectedElement = document.querySelector('#level-list');
        const level = selectedElement.options[selectedElement.selectedIndex].value;

        if(!level)
        {
            alert("Please enter a level");
            return;
        }

        if($levelList.find(level) != undefined)
        {
            if(!confirm(`Would you like to load in ${level}?`)) return;
            $.ajax({
                url: 'http://localhost:3000/level/' + encodeURIComponent(level),
                method: "GET",
                contentType: "application/json",
                success: function (response) {
                    const JSONResponse = JSON.parse(response)
                    clearBlocks();
                    for(let i = 0; i < JSONResponse.length; i++)
                    {
                        const xPos = JSONResponse[i]["x"];
                        const yPos = JSONResponse[i]["y"];
                        const type = JSONResponse[i]["type"]
                        
                        createBlock(type, {
                            left: xPos,
                            top: yPos,
                        });
                    }
                },
                error: function (xhr, status, error) {
                    alert("error loading level: " + xhr.responseText);
                }
            });
        }
    })

    $("#save-level").click( () => {
        const levelId = $("#level-id").val().trim();

        if(!levelId) {
            alert("Pleave enter a level ID");
            return;         
        }

        const levelData = [];

        $(".block").each(function () {
            const $this = $(this);
            const position = $this.position();
            levelData.push({
                id: $this.attr("id"),
                x: position.left,
                y: position.top, 
                width: $this.width(),
                height: $this.height(),
                type: "block"    
            });
        });

        if(levelData.length === 0) {
            alert("The level is empty. Add some blocks before saving.");
            return;
        }

        $.ajax({
            url: 'http://localhost:3000/level/' + encodeURIComponent(levelId),
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify(levelData),
            success: function (response) {
                alert(response);
                loadLevelList();
            },
            error: function (xhr, status, error) {
                alert("Error saving level: " + xhr.responseText);
            }
        });
    });

    $("#rename-level").click( () => {

        const options = $("#additive-options");
        const renameInput = $(`
                <form name="rename-form" id="name-input">
                    <input type='text' id='new-level-id' placeholder='New Level ID'>
                    <input type='submit'>
                </form>
            `);
        let levelSelected = $("#level-id").replaceWith("<select id='level-list'> <option value=''>Select a level</option> </select>");
        levelSelected.id = "level-load-list";

        if(document.getElementById("new-level-id") === null)
        {
            options.append(renameInput);
            loadLevelList();
            document.querySelector("#rename-level").innerHTML = "Cancel";
            $("form").submit(function() {
            
                const newLevelId = $("#new-level-id").val().trim()        
                const selectedElement = document.querySelector('#level-list');
                const level = selectedElement.options[selectedElement.selectedIndex].value;
                
                if(!newLevelId)
                {
                    alert("Please enter a valid name.")
                    return;
                }    
    
                $.ajax({
                    url: 'http://localhost:3000/level/' + encodeURIComponent(level),
                    method: 'PUT',
                    contentType: "application/json",
                    data: JSON.stringify({"name": newLevelId}),
                    success: function (response) {
                        alert(response);
                    },
                    error: function (xhr, status, error) {
                        alert("Error renaming level: " + xhr.responseText);
                    }
                });
                loadLevelList();
            })   
            return;
        }

        levelSelected = $("#level-list").replaceWith("<input type='text' id='level-id' placeholder='Enter Level ID'></input>")
        document.querySelector("#additive-options").removeChild(document.querySelector("#name-input"));
        document.querySelector("#rename-level").innerHTML = "Rename";
    });
    loadLevelList();
});