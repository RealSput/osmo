const vctr = require('./vctr');
const fs = require('fs');

const gs = gamescene();

let add_stack = (arr) => {
  arr.read_top((index) => {
    if (index > 1) {
      let top_counter = arr.array[index - 1];
      let bef_counter = arr.array[index - 2];
      while_loop(greater_than(top_counter, 0), () => {
        top_counter.subtract(1);
        bef_counter.add(1);
      });
      arr.curr_index.subtract(1);
    }
  });
};

let read_stack = (arr, cb) => {
  arr.read_top((index) => {
    if (index > 1) {
      let top_counter = arr.array[index - 1];
      cb(top_counter, arr.array[index - 2], index);
    } else {
      cb(arr.array[1], arr.array[0], index);
    }
  });
};

let limit = 10;

let opcodes = vctr.create(limit);
let operands = vctr.create(limit);
let stack = vctr.create(10);

let opcodes_list = {
  CONST: 1,
  ADD: 2,
  DROP: 3,
  SUB: 4,
};

let instr_length = range(0, Object.keys(opcodes_list).length + 1);

let opcodes_functions = {
  1: (num) => {
    stack.push(num);
  },
  2: trigger_function(() => {
    add_stack(stack);
  }),
  3: trigger_function(() => {
    stack.pop();
  }),
  4: trigger_function(() => {
    read_stack(stack, (cunter_a, cunter_b) => {
      cunter_b.subtract_from(cunter_a);
    });
  }),
};

let objs = ['NOP'];
for (let i in opcodes_list) {
  objs.push(i);
}

let stack_texts = [];

let x = 15;
let y = 100;
let rr = range(0, limit);
for (let i in rr) {
  i = rr[i];
  let slot = [];
  objs.forEach((z) => {
    let g = unknown_g();
    let o = z.to_obj().with(X, x).with(Y, y).with(GROUPS, g).with(SCALING, 0.3);
    $.add(o);
    if (z != 'NOP') $.add(toggle_off_trigger(g));
    slot.push({
      text: z,
      show: () => $.add(toggle_on_trigger(g)),
      hide: () => $.add(toggle_off_trigger(g)),
    });
  });
  stack_texts.push(slot);
  x += 45;
}

operands.display(15, 75);
stack.display(15, 15);

let cr = unknown_c();
let crg = unknown_g();

$.add({
  OBJ_ID: 211,
  X: 15,
  Y: 100,
  GROUPS: crg,
  Z_LAYER: -100,
});

$.add({
  OBJ_ID: 211,
  X: 500,
  Y: 100,
  COLOR: cr,
});

$.add('Run program'.to_obj().with(X, 500).with(Y, 100).with(SCALING, 0.4));

let exec_instructions = () => {
  let instr_length_ = instr_length.slice(1);
  opcodes.for_each((counter, index) => {
    counter.to_const(instr_length_, (val) => {
      global.op_args = operands.array[index];
      let f = opcodes_functions[val];
      if (typeof f == 'function') {
        f(operands.array[index]);
      } else {
        f.call();
      }
    });
    wait(0.5);
  });
};

let curr_pos = counter(0);
let row_pos = counter(0);
let is_on_finish_button = counter(false);

on(
  gs.button_a(),
  trigger_function(() => {
    is_on_finish_button.if_is(
      EQUAL_TO,
      0,
      trigger_function(() => {
        row_pos.if_is(
          EQUAL_TO,
          0,
          trigger_function(() => {
            let row = opcodes.array;
            let _limit = instr_length[instr_length.length - 1];

            curr_pos.to_const(range(0, limit), (position) => {
              row[position].if_is(
                EQUAL_TO,
                _limit,
                trigger_function(() => {
                  row[position].subtract(_limit + 1);
                  let le = stack_texts[position];
                  le[le.length - 1].hide();
                })
              );

              row[position].if_is(
                SMALLER_THAN,
                _limit,
                trigger_function(() => {
                  row[position].add(1);
                })
              );

              row[position].to_const(instr_length, (de) => {
                stack_texts[position][de].show();
                if (de > 0) stack_texts[position][de - 1].hide();
              });
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

let lfbs = counter();

on(
  gs.button_b(),
  trigger_function(() => {
    row_pos.if_is(
      EQUAL_TO,
      1,
      trigger_function(() => {
        crg.move(45, 25, 0, NONE, 2, 1, 1, false, false);
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
            crg.move(0, -25, 0, NONE, 2, 1, 1, false, false);
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

    curr_pos.if_is(
      EQUAL_TO,
      limit + 1,
      trigger_function(() => {
        // reset
        curr_pos.subtract(limit + 1);
        is_on_finish_button.subtract(1);
        cr.set(rgb(255, 255, 255));
        crg.move(-495, 0, 0, NONE, 2, 1, 1, false, false);
      })
    );
  })
);

fs.writeFileSync(
  'out.txt',
  $.getLevelString({
    object_count_warning: false,
    info: true,
  })
);
