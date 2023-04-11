// 假设预约表已经存在，其中每个元素包含座位预约的起始时间和结束时间
var appointments = [
    {start: '2022-01-01 09:00:00', end: '2022-01-01 10:00:00'},
    {start: '2022-01-01 11:00:00', end: '2022-01-01 12:00:00'},
    {start: '2022-01-01 14:00:00', end: '2022-01-01 15:00:00'}
];

// 定义时间间隔为每小时
var interval = 60 * 60 * 1000;

// 定义一天的起始时间和结束时间
var day_start = new Date('2022-01-01 00:00:00').getTime();
var day_end = new Date('2022-01-01 23:59:59').getTime();

// 初始化空余时间列表
var free_slots = [];

// 从一天的起始时间开始，按照时间间隔遍历整个一天
var current_time = day_start;
while (current_time <= day_end) {
    // 判断座位是否被预约
    var is_appointed = false;
    for (var i = 0; i < appointments.length; i++) {
        var start_time = new Date(appointments[i].start).getTime();
        var end_time = new Date(appointments[i].end).getTime();
        if (start_time <= current_time && current_time < end_time) {
            is_appointed = true;
            break;
        }
    }

    // 如果座位没有被预约，记录当前时间段为空余时间
    if (!is_appointed) {
        free_slots.push({start: current_time, end: current_time + interval});
    }

    // 将当前时间增加一个时间间隔
    current_time = current_time + interval
    // 打印所有空余时间段
    for (var i = 0; i < free_slots.length; i++) {
        console.log(free_slots[i])
    }
}