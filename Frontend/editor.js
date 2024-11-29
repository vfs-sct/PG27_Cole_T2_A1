$(function () {
  let blockCounter = 0;
  function clearBlocks() {
    let editorWindow = document.querySelector("#editor");
    editorWindow.innerHTML = "";
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
          $levelList.append(`<option value="${id}">${id}</option>`);
        });
      },
      error: function (xhr, status, error) {
        console.error("Error fetching level list:", error);
      },
    });
  }

  function createBlock(type, css) {
    const blockId = `block-${blockCounter++}`;

    const block = $("<div></div>") // this would be for creating a div
      .addClass(`${type}`)
      .attr("id", blockId)
      .css(css)
      .appendTo("#editor");

    block.draggable({
      containment: "#editor",
      stop: function (event, ui) {},
    });

    block.click(function (event) {
      event.stopPropagation();
    });

    block.contextmenu(function (event) {
      event.preventDefault();
      if (confirm("Delete this block?")) {
        $(this).remove();
      }
    });
  }

  $("#add-static-block").click(() =>
    createBlock("static-block", {
      top: 0,
      left: 0,
    })
  );

  $("#add-dynamic-block").click(() =>
    createBlock("dynamic-block", {
      top: 0,
      left: 0,
    })
  );

  $("#add-small-enemy").click(() =>
    createBlock("small-enemy", {
      top: 0,
      left: 0,
    })
  );

  $("#add-large-enemy").click(() =>
    createBlock("large-enemy", {
      top: 0,
      left: 0,
    })
  );

  $("#add-circle").click(() =>
    createBlock("circle", {
      top: 0,
      left: 0,
    })
  );

  $("#clear-blocks").click(() => {
    if (confirm("Are you sure you want to clear all blocks from the window?")) {
      clearBlocks();
    }
  });

  $("#load-level").click(() => {
    const $levelList = $("#level-list");
    const selectedElement = document.querySelector("#level-list");
    const level = selectedElement.options[selectedElement.selectedIndex].value;

    if (!level) {
      alert("Please enter a level");
      return;
    }

    if ($levelList.find(level) != undefined) {
      if (!confirm(`Would you like to load in ${level}?`)) return;
      $.ajax({
        url: "http://localhost:3000/level/" + encodeURIComponent(level),
        method: "GET",
        contentType: "application/json",
        success: function (response) {
          const JSONResponse = JSON.parse(response);
          clearBlocks();
          for (let i = 0; i < JSONResponse.length; i++) {
            const xPos = JSONResponse[i]["x"];
            const yPos = JSONResponse[i]["y"];
            const type = JSONResponse[i]["type"];

            createBlock(type, {
              left: xPos,
              top: yPos,
            });
          }
        },
        error: function (xhr, status, error) {
          alert("error loading level: " + xhr.responseText);
        },
      });
    }
  });

  function CreateLevel(levelData, querySelector, JSONType) {
    $(querySelector).each(function () {
      const $this = $(this);
      const position = $this.position();
      levelData.push({
        id: $this.attr("id"),
        x: position.left,
        y: position.top,
        width: $this.width(),
        height: $this.height(),
        type: JSONType,
      });
    });
  }

  $("#save-level").click(() => {
    const levelId = prompt("Enter a level name");

    const levelData = [];
    CreateLevel(levelData, ".static-block", "static-block");
    CreateLevel(levelData, ".dynamic-block", "dynamic-block");
    CreateLevel(levelData, ".small-enemy", "small-enemy");
    CreateLevel(levelData, ".large-enemy", "large-enemy");
    CreateLevel(levelData, ".circle", "circle");


    if (levelData.length === 0) {
      alert("The level is empty. Add some blocks before saving.");
      return;
    }

    if (!levelId) {
      alert("Pleave enter a level ID");
      return;
    }

    $.ajax({
      url: "http://localhost:3000/level/" + encodeURIComponent(levelId),
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify(levelData),
      success: function (response) {
        alert(response);
        loadLevelList();
      },
      error: function (xhr, status, error) {
        alert("Error saving level: " + xhr.responseText);
      },
    });
  });

  $("#rename-level").click(() => {
    const options = $("#additive-options");
    const renameInput = $(`
                <form name="rename-form" id="name-input">
                    <input type='text' id='new-level-id' placeholder='New Level ID'>
                    <input type='submit' id='submit-new-name'>
                </form>
            `);
    const levelSelected = $(
      "<select id='level-list'> <option value=''>Select a level</option> </select>"
    );

    if (document.getElementById("new-level-id") === null) {
      options.append(levelSelected);
      options.append(renameInput);
      loadLevelList();
      document.querySelector("#rename-level").innerHTML = "Cancel";
      $("form").submit(function (event) {
        event.preventDefault();
        const newLevelId = $("#new-level-id").val().trim();
        const selectedElement = document.querySelector("#level-list");
        const level =
          selectedElement.options[selectedElement.selectedIndex].value;

        if (!newLevelId) {
          alert("Please enter a valid name.");
          return;
        }

        $.ajax({
          url: "http://localhost:3000/level/" + encodeURIComponent(level),
          method: "PUT",
          contentType: "application/json",
          data: JSON.stringify({ name: newLevelId }),
          success: function (response) {
            alert(response);
            removeTempLevelList();
          },
          error: function (xhr, status, error) {
            alert("Error renaming level: " + xhr.responseText);
          },
        });
      });
      return;
    }
    removeTempLevelList();
  });

  function removeTempLevelList() {
    document
      .querySelector("#additive-options")
      .removeChild(document.querySelector("#name-input"));
    document
      .querySelector("#additive-options")
      .removeChild(document.querySelector("#level-list"));
    document.querySelector("#rename-level").innerHTML = "Rename";
    loadLevelList();
  }

  $("#delete-level").click(() => {
    const options = $("#destructive-options");
    const selectedElement = document.querySelector("#level-list");
    const level = selectedElement.options[selectedElement.selectedIndex].value;

    if (!level) {
      alert("No level was selected to delete.");
      return;
    }

    if (confirm(`are you sure you want to delete ${level}`)) {
      $.ajax({
        url: "http://localhost:3000/level/" + encodeURIComponent(level),
        method: "DELETE",
        contentType: "application/json",
        success: function (response) {
          alert(response);
          clearBlocks();
          loadLevelList();
        },
        error: function (xhr, status, error) {
          alert("error renaming level: " + xhr.responseText);
        },
      });
    }
  });

  loadLevelList();
});
