const vctr = require('./vctr');
const fs = require('fs');

let add_stack = (arr) => {
  arr.read_top((index) => {
    if (index > 1) {
      let top_counter = arr.array[index - 1];
      let bef_counter = arr.array[index - 2];
      while_loop(greater_than(top_counter, 0), () => {
        top_counter.subtract(1);
        bef_counter.add(1);
      });
    }
  });
};

let limit = 10;

let opcodes = vctr.create(limit);
let operands = vctr.create(limit);
let stack = vctr.create(10);

opcodes.display(15, 100);
operands.display(15, 75);
stack.display(15, 15);

let opcodes_list = {
  CONST: 1,
  ADD: 2,
  DROP: 3,
};

let instr_length = range(0, Object.keys(opcodes_list).length + 1);

let opcodes_functions = {
  0: () => {},
  1: (num) => {
    stack.push(num);
  },
  2: (x) => {
    add_stack(stack);
  },
  3: () => {
    stack.pop();
  },
};

$.add('1 = CONST (pushes values onto stack)'.to_obj().with(X, 50).with(Y, 200));
$.add(
  '2 = ADD (adds the last two values on stack)'
    .to_obj()
    .with(X, 50)
    .with(Y, 175)
);
$.add(
  '3 = DROP (removes last value from stack)'.to_obj().with(X, 50).with(Y, 150)
);

let cr = unknown_c();
console.log(cr);

$.add({
  OBJ_ID: 1,
  X: 15,
  Y: 15,
  COLOR: cr,
});

let exec_instructions = () => {
  opcodes.for_each((counter, index) => {
    counter.to_const(instr_length, (val) => {
      opcodes_functions[val](operands.array[index]);
    });
  });
};

let touching_nondual = counter(false);
let curr_pos = counter(0);
let row_pos = counter(0);
let is_on_finish_button = counter(false);

on(
  touch(),
  trigger_function(() => {
    is_on_finish_button.if_is(
      EQUAL_TO,
      0,
      trigger_function(() => {
        touching_nondual.add(1);
        row_pos.if_is(
          EQUAL_TO,
          0,
          trigger_function(() => {
            let row = opcodes.array;
            curr_pos.to_const(range(0, limit), (position) => {
              row[position].add(1);
            });
          })
        );

        row_pos.if_is(
          EQUAL_TO,
          1,
          trigger_function(() => {
            let row = operands.array;
            curr_pos.to_const(range(0, limit), (position) => {
              row[position].add(1);
            });
          })
        );
      })
    );

    is_on_finish_button.if_is(
      EQUAL_TO,
      1,
      trigger_function(() => {
        is_on_finish_button.subtract(1);
        cr.set(rgb(255, 255, 255));
        exec_instructions();
      })
    );
  })
);

on(
  touch_end(),
  trigger_function(() => {
    touching_nondual.subtract(1);
  })
);

let lfbs = counter();

on(
  touch(true),
  trigger_function(() => {
    touching_nondual.if_is(
      EQUAL_TO,
      0,
      trigger_function(() => {
        // we can assure that it is dual
        console.log(row_pos.item);

        row_pos.if_is(
          EQUAL_TO,
          1,
          trigger_function(() => {
            row_pos.subtract(1);
            curr_pos.add(1);
            lfbs.add(1);
          })
        );

        row_pos.if_is(
          EQUAL_TO,
          0,
          trigger_function(() => {
            lfbs.if_is(
              EQUAL_TO,
              0,
              trigger_function(() => {
                row_pos.add(1);
              })
            );
            lfbs.if_is(
              EQUAL_TO,
              1,
              trigger_function(() => {
                lfbs.subtract(1);
              })
            );
          })
        );

        curr_pos.if_is(
          EQUAL_TO,
          limit,
          trigger_function(() => {
            // add code to reset pos here
            cr.set(rgb(0, 255, 0));
            is_on_finish_button.if_is(
              EQUAL_TO,
              0,
              trigger_function(() => {
                is_on_finish_button.add(1);
              })
            );
          })
        );
      })
    );
  })
);

fs.writeFileSync('out.txt', $.getLevelString());
