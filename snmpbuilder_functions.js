const OIDPrefix = "1.3.6.1.4.1";
MIB_content = {"id":OIDPrefix, "name":"enterprises", "values":[]};

function loadMIB() {
  var mibfile = $("#mibfileimport")[0].files[0];
  if (!mibfile) {
    return;
  }

  reader = new FileReader();

  reader.addEventListener('load', function(e) {
      filetext = e.target.result;
      //$("#textdump")[0].textContent = filetext;
      parseMIB(e.target.result);
      $("#mib_selector").html("");
      buildOIDList(MIB_content, "mib_selector", "");
  });
  reader.addEventListener('error', function() {
      alert('Error : Failed to read file');
  });

  reader.readAsText(mibfile);

}

function parseMIB(rawText) {
  MIB_lines = rawText.split("\n");
  
  var x = 0; // Current MIB line
  current_tree = [0];
  
  // Look for the imports line to start from there
  for(x; x<MIB_lines.length; x++) {
    if (MIB_lines[x] == "IMPORTS") {
    x++;
      break;
    }
  }
  
  for(x; x<MIB_lines.length; x++) {
    // Look for a level 0 line, which provides the name of the node
    if (MIB_lines[x] != "" && MIB_lines[x][0] != " " && MIB_lines[x][0] != "-") {
    if (MIB_lines[x].trim() == "END") {
      break;
    }
      // Take the name and store it
      node_name = MIB_lines[x].split(" ")[0];
      // Keep searching until we find ::=
      for(x; x<MIB_lines.length; x++) {
        if (MIB_lines[x].includes("::=")) {
          // Extract the reference and split the parent name and node ID
          reference = MIB_lines[x].split("{ ")[1].split(" }")[0].split(" ");
          // Add values to Structure
      addMIBNode(reference[1], node_name, reference[0]);
          break;
        }
      }
    }
  }
  return;
}

function addMIBNode(id, name, parent_node) {
  var MIB_Node = {"id":id, "name":name, "values":[]};
  searchDown(parent_node, MIB_Node, MIB_content);  
}

function searchDown(search_term, MIB_Node, MIB_Branch) {
  if (MIB_Branch.name == search_term) {
    // add node
    MIB_Branch.values.push(MIB_Node);
  } 

  if (MIB_Branch.values.length == 0) {
    return;
  } else {
    for(var x=0; x<MIB_Branch.values.length; x++) {
      searchDown(search_term, MIB_Node, MIB_Branch.values[x]);
    }
  }
}

function buildOIDList() {

  buildDown(MIB_content);
}

function buildOIDList(MIB_node, parent_id, parent_oid) {
  var current_oid = parent_oid + MIB_node.id;
  $("#"+parent_id).append("<div id=\""+MIB_node.name+"\"> <input type=\"checkbox\" /> OID: "+current_oid+" Name: "+MIB_node.name+"</div>");
  // Add the div for the current node
  if (MIB_node.values.length == 0) {
    return;
  } else {
    for (var x=0; x<MIB_node.values.length; x++) {
      buildOIDList(MIB_node.values[x], MIB_node.name, current_oid+".");
    }
  }
}