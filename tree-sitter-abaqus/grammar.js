// tree-sitter grammar definition for abaqus input decks

module.exports = grammar({
  name: 'abaqus',

  externals: $ => [
    $._eof,
  ],

  extras: $ => [
    /[ \t\v\f]/,
  ],

  rules: {
    source_file: $ => repeat(choice(
      $.comment_line,
      $.blank_line,
      $.step_block,
      $.part_block,
      $.assembly_block,
      $.instance_block,
      $.keyword_block,
    )),

    // comment lines begin with two asterisks
    comment_line: $ => seq(
      $.comment,
      $._line_break
    ),

    comment: $ => token(seq('**', /[^\r\n]*/)),

    blank_line: $ => $._newline,

    _newline: $ => /\r?\n/,

    _line_break: $ => choice($._newline, $._eof),

    // analysis step blocks (*step ... *end step)
    step_block: $ => seq(
      $.step_keyword_line,
      repeat(choice(
        $.comment_line,
        $.blank_line,
        $.keyword_block,
      )),
      $.end_step_keyword_line
    ),

    step_keyword_line: $ => seq(
      token(seq('*', /[Ss][Tt][Ee][Pp]/)),
      repeat(seq(
        ',',
        choice(
          $.parameter,
          seq($._newline, $.parameter)
        )
      )),
      optional(','),
      optional($.comment),
      $._line_break
    ),

    end_step_keyword_line: $ => seq(
      token(seq('*', /[Ee][Nn][Dd]/, /[ \t]+/, /[Ss][Tt][Ee][Pp]/)),
      repeat(seq(
        ',',
        choice(
          $.parameter,
          seq($._newline, $.parameter)
        )
      )),
      optional(','),
      optional($.comment),
      $._line_break
    ),

    // part definition blocks (*part ... *end part)
    part_block: $ => seq(
      $.part_keyword_line,
      repeat(choice(
        $.comment_line,
        $.blank_line,
        $.keyword_block,
      )),
      $.end_part_keyword_line
    ),

    part_keyword_line: $ => seq(
      token(seq('*', /[Pp][Aa][Rr][Tt]/)),
      repeat(seq(
        ',',
        choice(
          $.parameter,
          seq($._newline, $.parameter)
        )
      )),
      optional(','),
      optional($.comment),
      $._line_break
    ),

    end_part_keyword_line: $ => seq(
      token(seq('*', /[Ee][Nn][Dd]/, /[ \t]+/, /[Pp][Aa][Rr][Tt]/)),
      repeat(seq(
        ',',
        choice(
          $.parameter,
          seq($._newline, $.parameter)
        )
      )),
      optional(','),
      optional($.comment),
      $._line_break
    ),

    // assembly definition blocks (*assembly ... *end assembly)
    assembly_block: $ => seq(
      $.assembly_keyword_line,
      repeat(choice(
        $.comment_line,
        $.blank_line,
        $.instance_block,
        $.keyword_block,
      )),
      $.end_assembly_keyword_line
    ),

    assembly_keyword_line: $ => seq(
      token(seq('*', /[Aa][Ss][Ss][Ee][Mm][Bb][Ll][Yy]/)),
      repeat(seq(
        ',',
        choice(
          $.parameter,
          seq($._newline, $.parameter)
        )
      )),
      optional(','),
      optional($.comment),
      $._line_break
    ),

    end_assembly_keyword_line: $ => seq(
      token(seq('*', /[Ee][Nn][Dd]/, /[ \t]+/, /[Aa][Ss][Ss][Ee][Mm][Bb][Ll][Yy]/)),
      repeat(seq(
        ',',
        choice(
          $.parameter,
          seq($._newline, $.parameter)
        )
      )),
      optional(','),
      optional($.comment),
      $._line_break
    ),

    // part instance blocks (*instance ... *end instance)
    instance_block: $ => seq(
      $.instance_keyword_line,
      repeat(choice(
        $.comment_line,
        $.blank_line,
        $.keyword_block,
      )),
      $.end_instance_keyword_line
    ),

    instance_keyword_line: $ => seq(
      token(seq('*', /[Ii][Nn][Ss][Tt][Aa][Nn][Cc][Ee]/)),
      repeat(seq(
        ',',
        choice(
          $.parameter,
          seq($._newline, $.parameter)
        )
      )),
      optional(','),
      optional($.comment),
      $._line_break
    ),

    end_instance_keyword_line: $ => seq(
      token(seq('*', /[Ee][Nn][Dd]/, /[ \t]+/, /[Ii][Nn][Ss][Tt][Aa][Nn][Cc][Ee]/)),
      repeat(seq(
        ',',
        choice(
          $.parameter,
          seq($._newline, $.parameter)
        )
      )),
      optional(','),
      optional($.comment),
      $._line_break
    ),

    // general keyword block and its associated data lines
    keyword_block: $ => prec.right(seq(
      $.keyword_line,
      repeat(choice(
        $.data_line,
        $.comment_line,
        $.blank_line
      ))
    )),

    keyword_line: $ => seq(
      '*',
      field('name', $.keyword_name),
      repeat(seq(
        ',',
        choice(
          $.parameter,
          seq($._newline, $.parameter)
        )
      )),
      optional(','),
      optional($.comment),
      $._line_break
    ),

    // keyword names may be multi-word and case insensitive
    keyword_name: $ => token(/[a-zA-Z][a-zA-Z0-9_\- ]*/),

    // parameters can be either key=value pairs or standalone flags
    parameter: $ => seq(
      field('name', $.parameter_name),
      optional(seq(
        '=',
        field('value', $.parameter_value)
      ))
    ),

    parameter_name: $ => token(/[a-zA-Z_][a-zA-Z0-9_\- ]*/),

    parameter_value: $ => choice(
      $.string,
      $.number,
      $.text
    ),

    string: $ => choice(
      token(seq('"', /[^"\r\n]*/, '"')),
      token(seq("'", /[^'\r\n]*/, "'"))
    ),

    number: $ => token(
      /[+-]?(\d+(\.\d*)?|\.\d+)([eEdD][+-]?\d+)?/
    ),

    text: $ => token(/[a-zA-Z0-9_\-\.\/\\:]+([ \t]+[a-zA-Z0-9_\-\.\/\\:]+)*/),

    // data lines contain comma-delimited numeric or text fields
    data_line: $ => seq(
      choice(
        // single field without commas
        $._data_field,
        // one or more commas with optional fields
        seq(
          optional($._data_field),
          repeat1(seq(',', optional($._data_field)))
        )
      ),
      optional($.comment),
      $._line_break
    ),

    _data_field: $ => choice(
      $.number,
      $.string,
      $.text
    )
  }
});
