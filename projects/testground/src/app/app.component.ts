import { Component, OnInit } from "@angular/core";
import {
  LogicError, TypeExpectError, UnsupportedError
} from "@slimebones/ngx-antievil";
import { AlertService } from "ngx-minithings/alert/alert.service";
import { AlertLevel } from "ngx-minithings/alert/models";
import { AlertUtils } from "ngx-minithings/alert/utils";
import { DatalistOption } from "ngx-minithings/datalist/datalist-option";
import { DatalistUtils } from "ngx-minithings/datalist/utils";
import { InputType } from "ngx-minithings/input/input-type";
import { ButtonMode } from "ngx-minithings/button/button.component";
import {
  PaginationItem,
  PaginationFilter,
  PaginationConfig,
  PaginationViewType,
  PaginationAttrType,
  PaginationAttr,
  makePaginationConfig
} from "ngx-minithings/pagination/models";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html"
})
export class AppComponent implements OnInit
{
  public InputType = InputType;
  public readonly AlertLevel = AlertLevel;
  public levelOptions: DatalistOption<AlertLevel>[];

  public level: AlertLevel;
  public message: string;
  public livingTime: number = 5;

  public paginationItems: PaginationItem[] = [];
  public paginationFilters: PaginationFilter[] = [];
  public paginationConfig: PaginationConfig;
  /* eslint-disable @typescript-eslint/ban-types */
  public customColumnSortingFunctions: Map<string, Function> =
    new Map<string, Function>([]);
  /* eslint-enable */

  public constructor(
    private alertService: AlertService,
  ) {}

  public ngOnInit(): void
  {
    this.levelOptions = [];

    // since we know enum iteration goes over keys first, we can safely store
    // their indexes as their actual values
    // for example for AlertLevel the array would be:
    // ["Info", "Warning", "Error", 0, 1, 2]
    Object.values(AlertLevel).forEach((
      level: string | number, index: number
    ) =>
    {
      if (isNaN(Number(level)))
      {
        this.levelOptions.push({
          value: level as string,
          obj: index
        });
      }
    });

    //////////////////////////////////////////////////////////////////////////
    ///////////////////////// Pagination settings ////////////////////////////
    //////////////////////////////////////////////////////////////////////////
    this.paginationConfig = makePaginationConfig(
      {
        itemCntPerPage: 15,
        visiblePagesCnt: 5,
        //noSuitableItemsText: "Подходящие страницы не найдены...",
        //noAnyItemsText: "Страницы не найдены...",
        centerAlignedColumns: ["Переиздание", "Статус", "Размер", "Дата"],
        filterIconPath: "assets/ngx-minithings/filter-icon.png",
        ascSortIconPath: "assets/ngx-minithings/asc-sort.png",
        descSortIconPath: "assets/ngx-minithings/desc-sort.png",
        viewType: PaginationViewType.Table
      });

    setTimeout(() => this.paginationFilters.unshift({
      id: "1",
      labelText: "Отдел",
      inputConfig: {
        type: InputType.Text,
        min: 1,
        max: 10,
        placeholder: "Введите название отдела..."
      },
    }), 5000 );

    setTimeout(() => this.paginationFilters.unshift({
      id: "2",
      labelText: "Количество страниц",
      inputConfig: {
        type: InputType.Number,
      },
    }), 5000 );

    this.paginationItems.push({
      text: "Журнал разработки Л904",
      route: "/another",
      filterValues: [
        {filterId: "1", filterValue: "IT"},
        {filterId: "2", filterValue: 200}
      ],
      attr: {
        "Размер": {
          type: PaginationAttrType.NUMBER,
          body: 200
        },
        "Статус": {
          type: PaginationAttrType.ICON,
          body: {
            priority: 3,
            src: "assets/ngx-minithings/info.svg",
            animatePing: true,
            cssClasses: ["w-6, h-6"]
          }
        },
        "Задача": {
          type: PaginationAttrType.STRING,
          body: "Задача #1"
        },
        "Метки": {
          type: PaginationAttrType.ICONS,
          body:
          [
            {
              priority: 3,
              src: "assets/ngx-minithings/keyboard.svg",
              animatePing: false,
              cssClasses: ["w-8", "h-8"]
            },
            {
              priority: 3,
              src: "assets/ngx-minithings/keyboard.svg",
              animatePing: true,
              cssClasses: ["w-8", "h-8"]
            },
            {
              priority: 3,
              src: "assets/ngx-minithings/keyboard.svg",
              animatePing: false,
              cssClasses: ["w-8", "h-8"]
            }
          ]
        },
      }
    });

    this.paginationItems.push({
      text: "Поваренная книга 1975",
      route: "/",
      filterValues: [
        {filterId: "1", filterValue: "Кухня"},
        {filterId: "2", filterValue: 200}
      ],
      attr: {
        "Тип": {
          type: PaginationAttrType.STRING,
          body: "Книга"
        },
        "Размер": {
          type: PaginationAttrType.NUMBER,
          body: 200
        },
        "Переиздание": {
          type: PaginationAttrType.BOOLEAN,
          body: true
        },
        "Дата & Время": {
          type: PaginationAttrType.DATETIME,
          body: {
            value: new Date(628021800000)
          }
        },
        "Дата": {
          type: PaginationAttrType.DATE,
          body: {
            value: new Date(628021800000),
            formatter: new Intl.DateTimeFormat("ru-RU",
              {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
          }
        },
        "Время": {
          type: PaginationAttrType.TIME,
          body: {
            value: new Date(628021800000)
          }
        },
        "Задача": {
          type: PaginationAttrType.STRING,
          body: "Задача #11"
        },
        "Кнопка": {
          type: PaginationAttrType.BUTTON,
          body: {
            priority: 1,
            labelText: "Alert",
            clickFunc: () =>
            {this.spawnAlert(AlertLevel.Info, "Pagination Alert");},

            mode: ButtonMode.WARNING,
            imageSrc: "assets/ngx-minithings/warning.svg"
          }
        },
      }
    });

    this.paginationItems.push({
      text: "Руководство пользователя блоком АТ1",
      route: "/",
      filterValues: [
        {filterId: "1", filterValue: "IT"},
        {filterId: "2", filterValue: 20}
      ],
      attr: {
        "Тип": {
          type: PaginationAttrType.STRING,
          body: "Руководство"
        },
        "Размер": {
          type: PaginationAttrType.NUMBER,
          body: 20
        },
        "Статус": {
          type: PaginationAttrType.ICON,
          body: {
            priority: 2,
            src: "assets/ngx-minithings/warning.svg",
            animatePing: false,
            cssClasses: ["w-6, h-6"]
          }
        },
        "Дата & Время": {
          type: PaginationAttrType.DATETIME,
          body: {
            value: new Date()
          }
        },
        "Дата": {
          type: PaginationAttrType.DATE,
          body: {
            value: new Date(),
            endStr: " год"
          }
        },
        "Время": {
          type: PaginationAttrType.TIME,
          body: {
            value: new Date(),
            endStr: " МСК+1"
          }
        },
        "Задача": {
          type: PaginationAttrType.STRING,
          body: "Задача #3"
        },
        "Метки": {
          type: PaginationAttrType.ICONS,
          body:
          [
            {
              priority: 3,
              src: "assets/ngx-minithings/info.svg",
              animatePing: false
            },
            {
              priority: 2,
              src: "assets/ngx-minithings/warning.svg",
              animatePing: false
            },
            {
              priority: 3,
              src: "assets/ngx-minithings/info.svg",
              animatePing: false
            }
          ]
        },
        "Кнопка": {
          type: PaginationAttrType.BUTTON,
          body: {
            priority: 2,
            labelText: "Error",
            clickFunc: () =>
            {this.spawnAlert(AlertLevel.Error, "Pagination Alert");},

            mode: ButtonMode.DANGER
          }
        },
      }
    });

    this.paginationItems.push({
      text: "Рекомендации к разработке проектов",
      route: "/",
      filterValues: [
        {filterId: "1", filterValue: "IT"},
        {filterId: "2", filterValue: 10}
      ],
      attr: {
        "Тип": {
          type: PaginationAttrType.STRING,
          body: "Руководство"
        },
        "Размер": {
          type: PaginationAttrType.NUMBER,
          body: 10
        },
        "Переиздание": {
          type: PaginationAttrType.BOOLEAN,
          body: false
        },
        "Статус": {
          type: PaginationAttrType.ICON,
          body: {
            priority: 1,
            src: "assets/ngx-minithings/error.svg",
            animatePing: false
          }
        },
        "Задача": {
          type: PaginationAttrType.STRING,
          body: "Задача #2"
        },
        "Метки": {
          type: PaginationAttrType.ICONS,
          body:
          [
            {
              priority: 1,
              src: "assets/ngx-minithings/error.svg",
              animatePing: false
            },
            {
              priority: 1,
              src: "assets/ngx-minithings/error.svg",
              animatePing: false
            },
            {
              priority: 1,
              src: "assets/ngx-minithings/error.svg",
              animatePing: false
            }
          ]
        },
      }
    });

    this.paginationItems.push({
      text: "Описание модуля для работы с wifi",
      route: "/",
      filterValues: [
        {filterId: "1", filterValue: "IT"},
        {filterId: "2", filterValue: 20}
      ],
      attr: {
        "Тип": {
          type: PaginationAttrType.STRING,
          body: "Руководство"
        },
        "Размер": {
          type: PaginationAttrType.NUMBER,
          body: 20
        },
        "Дата & Время": {
          type: PaginationAttrType.DATETIME,
          body: {
            value: new Date(2023, 10, 18)
          }
        },
        "Дата": {
          type: PaginationAttrType.DATE,
          body: {
            value: new Date(2023, 10, 18)
          }
        },
        "Задача": {
          type: PaginationAttrType.STRING,
          body: "Задача #22"
        }
      }
    });

    this.paginationItems.push({
      text: "Пособие по варке компотов 1999",
      route: "/",
      filterValues: [
        {filterId: "1", filterValue: "Кухня"},
        {filterId: "2", filterValue: 10}
      ],
      attr: {
        "Тип": {
          type: PaginationAttrType.STRING,
          body: "Руководство"
        },
        "Размер": {
          type: PaginationAttrType.NUMBER,
          body: 10
        },
        "Дата & Время": {
          type: PaginationAttrType.DATETIME,
          body: {
            value: new Date(2023, 10, 17)
          }
        },
        "Дата": {
          type: PaginationAttrType.DATE,
          body: {
            value: new Date(2023, 10, 17)
          }
        }
      }
    });

    this.paginationItems.push({
      text: "Норма потребления сахара ГОСТ 09.87",
      route: "/",
      filterValues: [
        {filterId: "1", filterValue: "Кухня"},
        {filterId: "2", filterValue: 10}
      ],
      attr: {
        "Тип": {
          type: PaginationAttrType.STRING,
          body: "ГОСТ"
        },
        "Размер": {
          type: PaginationAttrType.NUMBER,
          body: 10
        },
        "Дата & Время": {
          type: PaginationAttrType.DATETIME,
          body: {
            value: new Date(2024, 10, 17)
          }
        },
        "Дата": {
          type: PaginationAttrType.DATE,
          body: {
            value: new Date(2024, 10, 17)
          }
        }
      }
    });

    setTimeout(() => this.paginationItems.unshift({
      text: "0000000",
      route: null,
      filterValues: [],
      attr: {
        "Размер": {
          type: PaginationAttrType.NUMBER,
          body: 10
        }
      }
    }), 5000 );

    setTimeout(() => this.paginationItems.unshift({
      text: "11111111",
      route: null,
      filterValues: [],
      attr: {
        "Размер": {
          type: PaginationAttrType.NUMBER,
          body: 10
        }
      }
    }), 10000 );

    this.customColumnSortingFunctions.set("Задача",
      (a: PaginationAttr | undefined,
        b: PaginationAttr | undefined,
        modeFactor: number): number =>
      {
        if (a == undefined && b == undefined)
          return 0;
        else if (a != undefined && b == undefined)
          return (modeFactor == 1
            ? -1 * modeFactor
            : 1 * modeFactor);
        else if (a == undefined && b != undefined)
          return (modeFactor == 1
            ? 1 * modeFactor
            : -1 * modeFactor);
        else if (a!.body == b!.body)
          return 0;
        else if (parseInt(a!.body.slice(a!.body.indexOf("#") + 1)) >
                   parseInt(b!.body.slice(b!.body.indexOf("#") + 1)))
          return 1 * modeFactor;
        else
          return -1 * modeFactor;
      });
  }

  public spawnAlert(level: AlertLevel, message: string): void
  {
    this.alertService.spawn({
      level: level,
      message: message
    });
  }

  public onInputValue(
    type: string,
    value: string | number | DatalistOption<AlertLevel>
  ): void
  {
    const numValue: number = Number(value);

    switch (type)
    {
      case "level":
        if (!DatalistUtils.isDatalistOption(value))
        {
          throw new TypeExpectError(
            {"title": "value"}, "DatalistOption", typeof value
          );
        }
        if (!AlertUtils.isAlertLevel(value.value))
        {
          throw new TypeExpectError(
            {"title": "value"}, "AlertLevel", typeof value
          );
        }
        if (value.obj === undefined)
        {
          throw new LogicError(
            "datalist option's obj field should be defined for the AlertLevel"
          );
        }
        this.level = value.obj;
        break;
      case "message":
        if (typeof value !== "string")
        {
          throw new TypeExpectError(
            {"title": "value"}, "string", typeof value
          );
        }
        this.message = value;
        break;
      case "livingTime":
        if (isNaN(numValue))
        {
          throw new TypeExpectError(
            {"title": "value"}, "number", typeof value
          );
        }
        this.livingTime = numValue;
        break;
      default:
        throw new UnsupportedError("input type", type);
    }
  }
}
