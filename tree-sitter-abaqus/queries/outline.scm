; outline queries for abaqus documents in zed

; analysis steps with name parameter
(step_block
  (step_keyword_line
    (parameter
      name: (parameter_name) @_pn
      (#match? @_pn "(?i)^name$")
      value: (parameter_value) @name))) @item

; part definitions with name parameter
(part_block
  (part_keyword_line
    (parameter
      name: (parameter_name) @_pn
      (#match? @_pn "(?i)^name$")
      value: (parameter_value) @name))) @item

; assembly definitions with name parameter
(assembly_block
  (assembly_keyword_line
    (parameter
      name: (parameter_name) @_pn
      (#match? @_pn "(?i)^name$")
      value: (parameter_value) @name))) @item

; part instances with name parameter
(instance_block
  (instance_keyword_line
    (parameter
      name: (parameter_name) @_pn
      (#match? @_pn "(?i)^name$")
      value: (parameter_value) @name))) @item

; materials with name parameter
(keyword_block
  (keyword_line
    name: (keyword_name) @_kn
    (#match? @_kn "(?i)^material$")
    (parameter
      name: (parameter_name) @_pn
      (#match? @_pn "(?i)^name$")
      value: (parameter_value) @name))) @item

; node sets
(keyword_block
  (keyword_line
    name: (keyword_name) @_kn
    (#match? @_kn "(?i)^nset$")
    (parameter
      name: (parameter_name) @_pn
      (#match? @_pn "(?i)^(nset|name)$")
      value: (parameter_value) @name))) @item

; element sets
(keyword_block
  (keyword_line
    name: (keyword_name) @_kn
    (#match? @_kn "(?i)^elset$")
    (parameter
      name: (parameter_name) @_pn
      (#match? @_pn "(?i)^(elset|name)$")
      value: (parameter_value) @name))) @item

; surfaces with name parameter
(keyword_block
  (keyword_line
    name: (keyword_name) @_kn
    (#match? @_kn "(?i)^surface$")
    (parameter
      name: (parameter_name) @_pn
      (#match? @_pn "(?i)^name$")
      value: (parameter_value) @name))) @item

; amplitudes
(keyword_block
  (keyword_line
    name: (keyword_name) @_kn
    (#match? @_kn "(?i)^amplitude$")
    (parameter
      name: (parameter_name) @_pn
      (#match? @_pn "(?i)^name$")
      value: (parameter_value) @name))) @item

; general structural headings
(keyword_block
  (keyword_line
    name: (keyword_name) @name
    (#match? @name "(?i)^(heading|include|solid section|shell section|beam section|cohesive section|connector section|boundary|equation|coupling|rigid body|tie|contact pair|surface interaction|controls|output|restart)$"))) @item

