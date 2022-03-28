function arrangePhotos() {
    /* Layout of photos:
     * +---------------+
     * |   6 5 4 3 2   |
     * | 7           1 |
     * |   dashboard   |
     * +---------------+
     */

    var photoWidth = 175;
    var roomAreaPadding = 10;
    var verticalPadding = Math.max(10, roomArea.width * 0.01);
    var horizontalSpacing = Math.max(30, roomArea.height * 0.1);
    var verticalSpacing = (roomArea.width - photoWidth * 7 - verticalPadding * 2) / 6;

    // Position 1-7
    var regions = [
        { x: verticalPadding + (photoWidth + verticalSpacing) * 6, y: roomAreaPadding + horizontalSpacing * 2 },
        { x: verticalPadding + (photoWidth + verticalSpacing) * 5, y: roomAreaPadding + horizontalSpacing },
        { x: verticalPadding + (photoWidth + verticalSpacing) * 4, y: roomAreaPadding },
        { x: verticalPadding + (photoWidth + verticalSpacing) * 3, y: roomAreaPadding },
        { x: verticalPadding + (photoWidth + verticalSpacing) * 2, y: roomAreaPadding },
        { x: verticalPadding + photoWidth + verticalSpacing, y: roomAreaPadding + horizontalSpacing },
        { x: verticalPadding, y: roomAreaPadding + horizontalSpacing * 2 },
    ];

    var regularSeatIndex = [
        [4],
        [3, 5],
        [1, 4, 7],
        [1, 3, 5, 7],
        [1, 3, 4, 5, 7],
        [1, 2, 3, 5, 6, 7],
        [1, 2, 3, 4, 5, 6, 7],
    ];
    var seatIndex = regularSeatIndex[playerNum - 2];

    var item, region, i;

    for (i = 0; i < playerNum - 1; i++) {
        item = photos.itemAt(i);
        if (!item)
            continue;

        region = regions[seatIndex[photoModel.get(i).index] - 1];
        item.x = region.x;
        item.y = region.y;
    }
}

callbacks["AddPlayer"] = function(jsonData) {
    // jsonData: int id, string screenName, string avatar
    for (let i = 0; i < photoModel.count; i++) {
        let item = photoModel.get(i);
        if (item.id === -1) {
            let data = JSON.parse(jsonData);
            let uid = data[0];
            let name = data[1];
            let avatar = data[2];
            item.id = uid;
            item._screenName = name;
            item._general = avatar;
            photos.itemAt(i).tremble();
            return;
        }
    }
}

callbacks["RemovePlayer"] = function(jsonData) {
    // jsonData: int uid
    let uid = JSON.parse(jsonData)[0];
    for (let i = 0; i < photoModel.count; i++) {
        let item = photoModel.get(i);
        if (item.id === uid) {
            item.id = -1;
            item._screenName = "";
            item._general = "";
            return;
        }
    }
}

/*
callbacks["RoomOwner"] = function(jsonData) {
    // jsonData: int uid of the owner
    toast.show(J)
}
*/

callbacks["PropertyUpdate"] = function(jsonData) {
    // jsonData: int id, string property_name, value
    let data = JSON.parse(jsonData);
    let uid = data[0];
    let property_name = data[1];
    let value = data[2];

    if (Self.id === uid) {
        dashboardModel[property_name] = value;
        roomScene.dashboardModelChanged();
        return;
    }

    for (let i = 0; i < photoModel.count; i++) {
        let item = photoModel.get(i);
        if (item.id === uid) {
            item["_" + property_name] = value;
            return;
        }
    }
}

callbacks["ArrangeSeats"] = function(jsonData) {
    // jsonData: seat order
    let order = JSON.parse(jsonData);

    for (let i = 0; i < photoModel.count; i++) {
        let item = photoModel.get(i);
        item._seatNumber = order.indexOf(item.id) + 1;
    }

    dashboardModel.seatNumber = order.indexOf(Self.id) + 1;
    roomScene.dashboardModelChanged();
    
    // make Self to the first of list, then reorder photomodel
    let selfIndex = order.indexOf(Self.id);
    let after = order.splice(selfIndex);
    after.push(...order);
    let photoOrder = after.slice(1);

    for (let i = 0; i < photoModel.count; i++) {
        let item = photoModel.get(i);
        item.index = photoOrder.indexOf(item.id);
    }
    
    arrangePhotos();
}