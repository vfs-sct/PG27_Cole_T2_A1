$(function () {
    let blockCounter = 0;
    $("#add-block").click(function () {
        const blockId = `block-${blockCounter++}`;
        const block = $("<div></div>") // this would be for creating a div
            .addClass("block")
            .attr("id", blockId)
            .css({top: "10px", left: "10px" })
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
    });

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

    $("#save-level").click(function () {
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
            })
        })
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

    loadLevelList();

});